# Order Lookup - Technical Notes

## Document Authority

This document provides technical implementation details for the Order Lookup feature. It is constrained by higher-authority documents:

1. [use-cases.md](./use-cases.md) - Intent and business logic
2. [requirements.md](./requirements.md) - Functional and non-functional obligations
3. [constraints.md](./constraints.md) - Non-negotiable technical constraints
4. [api-contract.md](./api-contract.md) - External API behavior

**This document (technical-notes.md)** - Exploratory realization and implementation details

---

## 1. Architecture Overview

### Module Organization

The order lookup feature follows a layered architecture within the `src/modules/order/` directory:

```
src/modules/order/
├── schemas/
│   ├── order-lookup.schema.ts    # Lookup request/response schemas
│   └── order.schema.ts           # Order detail schemas
├── services/
│   ├── order-lookup.service.ts   # Lookup validation service
│   └── get-order.service.ts      # Order fetch service
└── actions/
    ├── lookup-order.action.ts    # Lookup Astro Action
    └── get-order.action.ts       # Get order Astro Action
```

### Separation of Concerns

| Layer        | Responsibility                              | Key Files      |
| ------------ | ------------------------------------------- | -------------- |
| **Schemas**  | Type definitions and runtime validation     | `*.schema.ts`  |
| **Services** | HTTP client interactions and business logic | `*.service.ts` |
| **Actions**  | Server-side action handlers (Astro Actions) | `*.action.ts`  |

### Import/Export Hierarchy

1. **Module-level exports** (`src/modules/order/*/index.ts`): Barrel files export all members from the layer
2. **Module index** (`src/modules/order/index.ts`): Exports schemas and services (actions commented out by convention)
3. **Global actions** (`src/actions/index.ts`): Registers actions in the `server` object for Astro Actions system

---

## 2. Schema Design

### Discriminated Union Pattern

The `orderLookupResponseSchema` uses Zod's discriminated union for type-safe response handling:

```typescript
export const orderLookupResponseSchema = z.discriminatedUnion("success", [
  successOrderLookupResponseSchema, // { id: number, success: true }
  failureOrderLookupResponseSchema, // { success: false }
]);
```

**Benefits:**

- **Type narrowing**: TypeScript automatically narrows the type based on `success` field
- **Exhaustiveness checking**: Compiler ensures all union cases are handled
- **Runtime validation**: Zod validates the discriminant field at runtime
- **Clear intent**: Explicitly models success vs failure states

### Phone Validation

The phone field uses regex validation to enforce exactly 4 digits:

```typescript
phone: z.string().regex(/^\d{4}$/);
```

**Rationale:**

- Requirements specify "exactly 4 digits" (VR-2)
- Schema IS the validation contract (TC-4)
- Prevents invalid data from reaching the backend
- Provides immediate feedback during action input validation

### Transaction Number Field

The transaction number uses generic `z.string()` without length constraints:

```typescript
number: z.string();
```

**Rationale:**

- TC-4 states "no backend validation constraints beyond schema"
- Backend manages transaction number format
- Frontend accepts any valid string per API contract
- Length/format validation is backend's responsibility

---

## 3. Service Layer

### HTTP Client (Ky)

The application uses **Ky** (a modern fetch wrapper) configured in `src/shared/infrastructure/http.ts`:

**Configuration:**

```typescript
export const http = ky.create({
  prefixUrl: `${import.meta.env.BACKEND_URL ?? "http://localhost:8000"}`,
  timeout: 30000, // 30 seconds (IC-1)
  hooks: {
    beforeRequest: [
      /* auth injection */
    ],
    beforeError: [
      /* error extraction */
    ],
  },
});
```

**Key Features:**

- **Base URL**: Configured via `BACKEND_URL` environment variable
- **Timeout**: Hard-coded 30 seconds (matches constraint IC-1)
- **Type Safety**: Custom `HttpContext` interface for auth tokens
- **Error Handling**: `beforeError` hook extracts API error messages

### Authentication Pattern

Authentication uses a **context-based approach** rather than header injection:

```typescript
// Service layer passes token in context
const response = await http.post("trades/lookup", {
  context: { token },
  json: data,
});

// HTTP client hook injects Authorization header
beforeRequest: [
  (request, options) => {
    const { token } = options.context;
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
  },
],
```

**Benefits:**

- Token is never hardcoded in service functions
- Easy to mock/test (pass mock token in context)
- Centralized auth logic in HTTP client
- Type-safe via TypeScript module augmentation

### Error Handling

The HTTP client provides sophisticated error handling:

1. **Error Extraction**: `extractErrorMessage()` parses API error responses
2. **Error Enrichment**: `beforeError` hook adds `apiMessage` and `apiIssues` to errors
3. **Type Guards**: `isHttpError()` checks if error is from Ky
4. **Utilities**:
   - `getErrorMessage()`: Extracts user-friendly message
   - `mapApiErrors()`: Maps validation issues to field-keyed object

---

## 4. Action Layer (Astro Actions)

### defineAction Pattern

Astro Actions provide type-safe server-side functions:

```typescript
export const lookupOrderAction = defineAction({
  input: z.object({
    number: z.string(),
    phone: z.string().regex(/^\d{4}$/),
  }),
  handler: async (input) => {
    // Server-side logic
  },
});
```

**Key Features:**

- **Input Validation**: Zod schema validates at runtime before handler executes
- **Type Safety**: Input and output types are inferred from schemas
- **Server Execution**: Runs server-side, keeping secrets secure
- **Error Handling**: Returns `{ data, error }` tuple

### Security Model

**Critical**: Actions execute server-side, preventing `BACKEND_API_KEY` exposure:

```typescript
handler: async (input) => {
  const token = import.meta.env.BACKEND_API_KEY; // Server-side only!
  const response = await orderLookup({ token, data: input });
  return response;
};
```

**Why this is secure:**

- Environment variables are only accessible server-side
- Action code never reaches the client bundle
- Token is injected at runtime on the server

### Error Handling in Actions

Actions catch errors and return `{ success: false }` to match API contract:

```typescript
handler: async (input) => {
  try {
    const response = await orderLookup({ token, data: input });
    return response;
  } catch (error) {
    return { success: false }; // Matches API contract
  }
};
```

**Rationale:**

- API contract specifies discriminated union response
- Generic error prevents information leakage (SC-3)
- Caller checks `success` field, not error codes

---

## 5. Two-Step Lookup Flow

### Implementation Details

The lookup process involves two sequential actions:

```
┌─────────────────┐     lookupOrderAction     ┌─────────────────┐
│   User Input    │ ─────────────────────────> │   Validation    │
│  (number, phone)│                            │                 │
└─────────────────┘                            └─────────────────┘
                                                      │
                            success: true             │ success: false
                            {id: 12345}               │ {success: false}
                              │                       │
                              ▼                       ▼
                  ┌─────────────────────┐    ┌─────────────────┐
                  │ getOrderAction({id})│    │  Display Error  │
                  │ Fetch Order Details │    │  (Generic Msg)  │
                  └─────────────────────┘    └─────────────────┘
                              │
                              ▼
                  ┌─────────────────────┐
                  │  Display Order Info │
                  │  (Products, Status) │
                  └─────────────────────┘
```

### Step 1: Validation (lookupOrderAction)

- **Input**: `{ number: string, phone: string }`
- **Process**: Calls `POST /trades/lookup` endpoint
- **Success**: Returns `{ id: number, success: true }`
- **Failure**: Returns `{ success: false }`

### Step 2: Fetch (getOrderAction)

- **Input**: `{ id: number }` (from step 1)
- **Process**: Calls `GET /trades/{id}` endpoint
- **Output**: Full order details with products and timestamps

### State Management

**No state is persisted between steps** (per SC-4):

- Order ID is passed directly from step 1 to step 2
- No session, cookies, or storage used
- Each lookup requires full re-authentication

### Security Considerations

- **Order ID exposure**: The ID is just a number, not sensitive
- **No enumeration risk**: Failed lookups return generic errors
- **Backend validation**: Phone matching happens server-side

---

## 6. Security Implementation

### Token Handling

**BACKEND_API_KEY** is accessed via `import.meta.env` inside action handlers:

```typescript
const token = import.meta.env.BACKEND_API_KEY;
```

**Security measures:**

- Token never leaves server-side code
- Actions are server-only (not in client bundle)
- Environment variables filtered by Astro (only `PUBLIC_*` exposed to client)

### Session Management

**No session persistence** (SC-4):

- No cookies set
- No localStorage/sessionStorage usage
- No automatic login or account linking
- Each lookup is independent

### Error Message Security

**Generic error messages only** (SC-3):

```typescript
// Indonesian
"Nomor transaksi atau nomor telepon tidak cocok. Silakan periksa kembali data yang Anda masukkan.";

// English
"Transaction number or phone number does not match. Please check the data you entered.";
```

**Why this matters:**

- Prevents confirming valid transaction numbers exist
- Prevents brute-force attacks on phone digits
- No distinction between "not found" vs "wrong phone"

### CSRF Protection

**Current state**: No explicit CSRF protection implemented.

**Rationale:**

- Actions use POST with JSON body (not form submissions)
- No session cookies to hijack
- Each request is stateless
- Future: May add CSRF tokens if needed

---

## 7. Error Handling Patterns

### Error Types

The system handles multiple error types:

1. **Input Validation Errors** (Zod)
   - Invalid phone format (not 4 digits)
   - Missing required fields
   - Handled by Astro Actions before handler executes

2. **HTTP Errors** (Ky)
   - Network failures
   - Timeout (30 seconds)
   - Non-2xx responses
   - Handled by `beforeError` hook

3. **Schema Parsing Errors** (Zod)
   - API returns unexpected data structure
   - Handled by `.parse()` in service layer

4. **API Contract Errors**
   - Invalid credentials
   - Order not found
   - Handled by returning `{ success: false }`

### Error Flow

```
User Input
    ↓
Astro Actions (input validation)
    ↓ (fails) → BAD_REQUEST error
    ↓
Service Layer (HTTP request)
    ↓ (fails) → HTTPError
    ↓
Schema Parsing (Zod)
    ↓ (fails) → ZodError
    ↓
Action Handler
    ↓ (catches any error)
    ↓
Return { success: false }
```

### User Feedback

Errors are displayed via **Sonner toast notifications**:

- **Validation errors**: "Nomor transaksi atau nomor telepon tidak cocok..."
- **Network errors**: Generic message via `getErrorMessage()`
- **Timeout errors**: Treated as network errors

---

## 8. Type Safety

### Discriminated Union Narrowing

TypeScript narrows types based on the `success` field:

```typescript
const result = await actions.lookupOrderAction({ number, phone });

if (result.success) {
  // TypeScript knows result.id exists
  const orderId = result.id; // number
} else {
  // TypeScript knows result.id does NOT exist
  // Only result.success is available
}
```

### Exported Types

Key types exported from schemas:

```typescript
// From order-lookup.schema.ts
export type OrderLookupResponse = z.infer<typeof orderLookupResponseSchema>;
export type OrderLookupBodyValidator = z.infer<
  typeof orderLookupBodyValidatorSchema
>;

// From order.schema.ts
export type OrderResponse = z.infer<typeof orderResponseSchema>;
```

### Service Layer Type Safety

Service functions are fully typed:

```typescript
interface IOrderLookupParams {
  token: string;
  data: OrderLookupBodyValidator;
}

export async function orderLookup(
  params: IOrderLookupParams,
): Promise<OrderLookupResponse> {
  // Type-safe implementation
}
```

---

## 9. Known Issues & Technical Debt

### Critical Gaps

1. **No Test Coverage**
   - No unit tests for schemas
   - No integration tests for services
   - No e2e tests for the lookup flow
   - **Impact**: Changes may break functionality undetected
   - **Recommendation**: Add tests before major refactoring

2. **No Frontend Implementation**
   - No lookup form component exists
   - No UI for displaying order details
   - Actions exist but cannot be called from UI
   - **Impact**: Feature is backend-only
   - **Recommendation**: Implement React/Astro components

3. **No CSRF Protection**
   - Actions vulnerable to CSRF if cookies added later
   - **Impact**: Low (currently stateless)
   - **Recommendation**: Add CSRF tokens if implementing sessions

### Technical Debt

1. **Two-Step Process**
   - Current implementation requires two API calls
   - Could be optimized to single call
   - **Trade-off**: Security vs convenience

2. **Error Handling**
   - All errors return `{ success: false }`
   - No error logging for debugging
   - **Impact**: Hard to troubleshoot production issues

3. **Schema Duplication**
   - Phone regex defined in both schema and action
   - **Recommendation**: Centralize validation rules

### Future Considerations

1. **Rate Limiting** (FC-1)
   - Not currently implemented
   - May be added if abuse detected
   - Must be implementable without breaking changes

2. **Caching** (IC-3)
   - No client-side caching currently
   - Optional feature for future implementation

3. **GraphQL Migration**
   - Currently REST-based
   - GraphQL could reduce over-fetching
   - **Effort**: High (requires backend changes)

---

## 10. Integration Points

### Environment Variables

Required environment variables:

```bash
BACKEND_URL=http://localhost:8000        # Backend API base URL
BACKEND_API_KEY=your_api_key_here        # Authentication token
```

**Security:**

- Never expose `BACKEND_API_KEY` to client
- Use `import.meta.env` (server-side only)
- Astro filters env vars (only `PUBLIC_*` exposed to client)

### HTTP Client Hooks

**beforeRequest**: Injects Authorization header

```typescript
(request, options) => {
  const { token } = options.context;
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
};
```

**beforeError**: Extracts API error details

```typescript
async (error: HTTPError) => {
  const errorData = await extractErrorMessage(error.response);
  // Enrich error with apiMessage and apiIssues
};
```

### API Endpoints

| Endpoint         | Method | Action              | Service         |
| ---------------- | ------ | ------------------- | --------------- |
| `/trades/lookup` | POST   | `lookupOrderAction` | `orderLookup()` |
| `/trades/{id}`   | GET    | `getOrderAction`    | `getOrder()`    |

---

## 11. Development Guidelines

### Adding New Actions

1. Create action file in `src/modules/order/actions/`
2. Export from `src/modules/order/actions/index.ts`
3. Export from `src/actions/index.ts` in `server` object
4. Follow naming convention: `{verb}{Noun}Action`

### Modifying Schemas

1. Update schema in appropriate `*.schema.ts` file
2. Export type using `z.infer<typeof schemaName>`
3. Update barrel export if needed
4. **Warning**: Changing response schemas may break API contract (TC-1)

### Testing Strategy (Future)

When tests are added:

1. **Unit Tests**: Schema validation, utility functions
2. **Integration Tests**: Service layer with mocked HTTP client
3. **E2E Tests**: Full lookup flow with test backend

**Mocking HTTP Client:**

```typescript
vi.mock("@/shared/infrastructure/http", () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));
```

---

## 12. Troubleshooting

### Common Issues

**Issue**: Action returns "BACKEND_API_KEY is not defined"

- **Cause**: Environment variable not set
- **Fix**: Add `BACKEND_API_KEY` to `.env` file

**Issue**: Lookup always returns `{ success: false }`

- **Cause**: Invalid credentials or backend error
- **Debug**: Check browser network tab for actual API response
- **Note**: Generic error is intentional (SC-3)

**Issue**: TypeScript errors in action calls

- **Cause**: Actions not exported correctly
- **Fix**: Verify action is in `src/actions/index.ts` `server` object

**Issue**: Phone validation fails

- **Cause**: Input contains non-digit characters
- **Fix**: Ensure exactly 4 digits (0-9)

---

## Changelog

| Version | Date       | Changes                         |
| ------- | ---------- | ------------------------------- |
| 1.0.0   | 2024-XX-XX | Initial technical documentation |

---

_Document Authority: This document provides implementation details and technical context for the order lookup feature. It must not contradict higher-authority documents (use-cases.md, requirements.md, constraints.md, api-contract.md)._
