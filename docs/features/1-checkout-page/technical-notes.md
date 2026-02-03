# Checkout Page - Technical Notes

## Overview

This document describes the technical implementation details, architectural patterns, and development decisions for the checkout page feature. It captures the "how" of implementation - the exploratory realization of requirements defined in higher-authority documents.

---

## 1. Frontend Architecture

### 1.1 Page Structure

**Main Checkout Page** (`/bayar`)

- **File**: `src/pages/bayar.astro`
- **Architecture**: Astro page with React islands for interactive sections
- **Static Sections (Astro)**: Page layout, headers, static text content
- **Interactive Sections (React Islands)**:
  - Customer information form
  - Quantity controls
  - Order summary

**Success Page** (`/bayar/sukses`)

- **File**: `src/pages/bayar/sukses.astro`
- **Architecture**: Separate route with its own structure
- **Data Source**: Astro route state (passed via navigation)
- **Refresh Behavior**: Redirect to catalog if state is empty

### 1.2 Component Organization

**Directory Structure**:

```
src/modules/checkout/
├── actions/
│   ├── batch-transaction.action.ts
│   └── index.ts
├── components/          # New directory for UI components
│   ├── CheckoutForm.tsx         # React
│   ├── CustomerInfoForm.tsx     # React
│   ├── OrderSummary.tsx         # React
│   ├── ProductList.tsx          # React
│   ├── CheckoutButton.tsx       # React
│   └── [Astro components if needed]
├── schemas/
├── services/
├── stores/              # New directory
│   └── form.store.ts            # Form state persistence
│   └── checkout-history.store.ts
├── types/
└── utils/               # New directory
    ├── format-customer-info.ts
    ├── build-batch-operations.ts
    ├── generate-whatsapp-message.ts
    └── format-rupiah.ts
```

**Component Mixing**: Both Astro and React components live in the same `components/` directory for simplicity.

### 1.3 Hydration Strategy

- **Directive**: `client:load`
- **Rationale**: Checkout form requires immediate interactivity; no benefit from deferred loading
- **Code Splitting**: React islands are lazy-loaded by Astro's build system

---

## 2. Form Implementation

### 2.1 Form Library

**Choice**: React Hook Form

**Integration Pattern**:

- **NOT using HTML form actions** - Instead, handle submission programmatically via Astro actions
- Call Astro action directly from `onSubmit` handler
- Provides full control over submission flow and error handling

### 2.2 Validation Strategy

**Client-Side Validation Schemas**:

- Create separate Zod schemas for client-side form validation
- Located in `src/modules/checkout/schemas/`
- Distinct from backend schemas (though may be similar)

**Validation Timing**: Submit-only

- **No real-time validation** during typing
- **No blur validation**
- React Hook Form configuration:
  ```typescript
  useForm({
    mode: "onSubmit", // Only validate on submit
    reValidateMode: "onSubmit", // Only revalidate on subsequent submits
  });
  ```

**Error Display**:

- **Pattern**: Inline errors below each field using React Hook Form's field error state
- **Component**: shadcn/ui form components (already styled)
- **Toast**: Use `sonner/toast` for global errors (API failures, network issues)

### 2.3 Phone Number Validation

- **Implementation**: Custom Zod validator
- **Pattern**: `^(\\+62|62|08)\\d+$`
- **Applied**: Client-side only (on submit)
- **Format Hints**: Placeholder text or helper text in form field

---

## 3. State Management

### 3.1 Checkout History Store

**File**: `src/modules/checkout/stores/checkout-history.store.ts`

**Implementation**:

```typescript
type CheckoutHistoryItem = {
  transactionId: number;
  timestamp: string; // ISO timestamp
};

type CheckoutHistory = CheckoutHistoryItem[];
```

**API Surface**:

- `addCheckoutHistory(transactionId: number, timestamp: string): void`
- `getCheckoutHistory(): CheckoutHistory`
- `getLatestCheckout(): CheckoutHistoryItem | null`
- `clearCheckoutHistory(): void`

**Persistence**:

- **Method**: Nanostore persistence (using `persistentAtom` or similar)
- **Storage**: localStorage
- **Error Handling**: TBD - Consider graceful degradation if localStorage quota exceeded or serialization fails

### 3.2 Form State Persistence

**File**: `src/modules/checkout/stores/form.store.ts`

**Purpose**: Persist form data across navigation (user leaves and returns to `/bayar`)

**Implementation**:

- Nanostore with localStorage persistence
- Form component syncs with store on mount/unmount

**Scope**: Local to checkout module

### 3.3 Product Data State

**Storage**: Local React state (within order summary component)

**Loading Strategy**:

- Fetch via batch read on component mount
- **No caching** - always fetch fresh data to ensure price/stock accuracy
- Loading state shown while fetching

**Cart Synchronization**:

- Read cart items from cart store
- Pass IDs to batch read action
- Store fetched products locally in component

---

## 4. Data Flow & Integration

### 4.1 Customer Information Formatting

**Utility Function**: `formatCustomerInfo(formData): string`

**Location**: `src/modules/checkout/utils/format-customer-info.ts`

**Output Format**:

```
Full Name: <value>
Phone: <value>
Email: <value>
Street: <value>
City: <value>
Province: <value>
Postal Code: <value>
Notes: <value>
```

**Special Characters**: TBD - Decide on escaping strategy for newlines in user input

### 4.2 Batch Operation Construction

**Utility Function**: `buildBatchOperations(formData, cartItems, products, spaceId): BatchOperationsBody`

**Location**: `src/modules/checkout/utils/build-batch-operations.ts`

**Sequence Enforcement**:

1. **Operation 1**: Create transaction with `ref: "tx-main"`, include `space_id`
2. **Operation 2**: Update transaction using `idRef: "tx-main"` with `receiver_notes`
3. **Operations 3+**: Create detail for each cart item using `transactionIdRef: "tx-main"`

### 4.3 Response Handling

**Transaction Number Extraction**:

```typescript
const transactionNumber: string = response.created[0].number;
```

**Validation**:

- Validate response structure using `batchOperationResultSchema`
- If validation fails, show toast error notification
- Do NOT proceed to success page if response is invalid

**Error Display**:

- Toast notification with generic error message for unexpected response structure

### 4.4 Space ID Configuration

**Source**: Environment variable `SPACE_ID`

**Access Location**: Astro action handler

**Implementation**:

```typescript
// In batch-transaction.action.ts
const spaceId = import.meta.env.SPACE_ID;
```

**Usage**: Pass to utility function, which includes it in create operation's `data.space_id`

**Missing Env Var**: Application should fail (throw error) if not defined

---

## 5. Component Architecture

### 5.1 Component Breakdown

**All React Components** (Islands):

1. **`CheckoutForm.tsx`** (Top-level container)
   - Manages form state (React Hook Form)
   - Coordinates submission flow
   - Renders CustomerInfoForm and OrderSummary

2. **`CustomerInfoForm.tsx`**
   - Form fields for customer information
   - Integrates with parent form context
   - Displays inline validation errors

3. **`OrderSummary.tsx`**
   - Displays cart items with prices
   - Shows total
   - Sticky on desktop (Tailwind `sticky`)
   - React island (separate from main form)

4. **`ProductList.tsx`**
   - Renders list of cart items
   - Includes quantity controls
   - Shows subtotals

5. **`CheckoutButton.tsx`**
   - Submit button with loading state
   - Disabled during submission

**Component Hierarchy**: TBD - Finalize during implementation based on component reuse needs

### 5.2 Order Summary Sticky Behavior

**Implementation**: Tailwind CSS `sticky` utility

```tsx
<div className="sticky top-4">{/* Order summary content */}</div>
```

**Island Strategy**: Separate React island from main form to optimize re-renders

### 5.3 Quantity Controls

**Reuse**: Leverage existing cart quantity control components

**Cart Sync**: Quantity changes directly update the cart store

**Stock Validation**:

- **UI Pattern**: Disable increment button when quantity equals stock
- **Visual Feedback**: Button appears disabled (via Tailwind disabled styles)

### 5.4 Loading States

**Checkout Button**:

- React state: `isSubmitting` from React Hook Form
- Show spinner in button
- Change text to "Memproses..." or similar
- Disable button during submission

**Form Inputs**:

- Disable all inputs when `isSubmitting === true`

**Product Loading** (Initial page load):

- Show skeleton loader while fetching product data
- Implementation: shadcn/ui skeleton component or custom loading state

---

## 6. Error Handling & User Feedback

### 6.1 Inline Validation Errors

**Component**: shadcn/ui form error components

**Pattern**:

```tsx
<FormField
  control={form.control}
  name="fullName"
  render={({ field, fieldState }) => (
    <>
      <FormControl>
        <Input {...field} />
      </FormControl>
      {fieldState.error && (
        <FormMessage>{fieldState.error.message}</FormMessage>
      )}
    </>
  )}
/>
```

**Styling**: Pre-styled by shadcn/ui components

### 6.2 Toast Notifications

**Library**: Existing toast implementation (check `src/components/ui/sonner.tsx` or similar)

**Usage Location**: Component-level imports

**State Management**: Refer to shadcn/ui Sonner documentation (typically provider-based)

**Use Cases**:

- API errors (batch transaction fails)
- Network errors
- Unexpected response structure
- Empty cart redirect notification

### 6.3 API Error Handling

**Error Mapping**: None - Display generic error messages

**Message Storage**: Hardcoded in components/utils

**Error Types** (No differentiation):

- Network errors → Generic error toast
- Validation errors → Generic error toast
- Server errors → Generic error toast

### 6.4 Stock Validation Errors

**Validation Timing**: On page load (during product fetch)

**Out-of-Stock Flow**: TBD - Decide on exact UX (e.g., disable checkout, show warning, highlight items)

**Product Highlighting**: TBD - Could use border color, badge, or alert component

---

## 7. WhatsApp Integration

### 7.1 Message Generation

**Utility Function**: `generateWhatsAppMessage(transaction, products, customerInfo): string`

**Location**: `src/modules/checkout/utils/generate-whatsapp-message.ts`

**URL Encoding**: `encodeURIComponent(message)`

**Message Format**: As defined in use-case.md (no changes)

### 7.2 Price Formatting

**Utility Function**: `formatRupiah(amount: number): string`

**Location**: `src/shared/utils/format-rupiah.ts` (shared across app)

**Implementation**:

```typescript
new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
}).format(amount);
```

**Decimal Separator**: Dot (e.g., "Rp 25.000")

**Usage**: Order summary, WhatsApp message, success page

### 7.3 Redirect Mechanism

**Implementation**: HTML anchor tag with `target="_blank"`

```tsx
<a
  href={`https://wa.me/6285246428746?text=${encodedMessage}`}
  target="_blank"
  rel="noopener noreferrer"
>
  Lanjutkan ke WhatsApp
</a>
```

**Mobile Behavior**: Opens WhatsApp app automatically (handled by `wa.me` protocol)

---

## 8. Testing Strategy

**Approach**: No automated tests

**Testing Method**: Manual testing during development

---

## 9. Performance & Optimization

### 9.1 Product Data Loading

**Strategy**: Client-side fetching on mount

**Loading State**: Show skeleton loaders during fetch

**Empty State Prevention**: Skeleton component prevents layout shift

### 9.2 Code Splitting

**Method**: Lazy-loaded React islands (automatic via Astro)

**Hydration Directive**: `client:load`

### 9.3 Form Submission

**Debouncing**: None

**Double Submission Prevention**: TBD - Consider standard patterns (disable button, track submission state, etc.)

---

## 10. Development & Build Workflow

### 10.1 Local Development

**Backend**: Use dev backend for testing

**WhatsApp Testing**: Use test phone number (same as production: `6285246428746`)

**Checkout Flow**: Full end-to-end testing locally with dev backend

### 10.2 Environment Variables

**Required Variables**:

- `BACKEND_API_KEY` - Backend API authentication
- `SPACE_ID` - Transaction space identifier

**Missing Env Behavior**: Application fails to start/run (throw error)

**Additional Env Vars**: None required

### 10.3 Type Safety

**Schema Export**: Export TypeScript types from Zod schemas

**Astro/React Boundary**: Use exported schema types as props interfaces

**Pattern**:

```typescript
// In schema file
export type CustomerFormData = z.infer<typeof customerFormSchema>;

// In React component
interface CustomerInfoFormProps {
  onSubmit: (data: CustomerFormData) => void;
}
```

---

## 11. User Experience Details

### 11.1 Empty Cart Redirect

**Location**: Page component (`/bayar`)

**Implementation**:

```typescript
// In bayar.astro
const cartItems = $cart; // Read from store
if (cartItems.length === 0) {
  return Astro.redirect("/katalog");
}
```

**Toast Notification**: Show after redirect - "Keranjang kosong. Silakan pilih produk terlebih dahulu."

### 11.2 Success Page Data Passing

**Method**: Astro route state (via `navigate()` with state)

**Data Passed**:

- Transaction number
- Order details
- Customer information

**Refresh Handling**:

- If state is empty (user refreshed), redirect to catalog
- Implementation: Check for state in success page component, redirect if missing

### 11.3 Currency Formatting Consistency

**Shared Utility**: `formatRupiah()` in `src/shared/utils/`

**Usage Points**:

- Order summary component
- WhatsApp message generation
- Success page display

**Consistency**: All components import and use the same utility function

---

## 12. Outstanding Implementation Decisions

The following items require decisions during implementation:

1. **localStorage Error Handling**: Strategy for quota errors or serialization failures in checkout history store
2. **Exact Component Hierarchy**: Finalize parent-child relationships during component development
3. **Stock Validation UX**: Specific UI treatment for out-of-stock products
4. **Product Highlighting**: Visual pattern for unavailable items
5. **Double Submission Prevention**: Specific pattern (likely button disable + submission state tracking)
6. **Special Character Escaping**: Strategy for handling newlines/special chars in customer info

---

## Document Metadata

**Authority Level**: 5 (Technical Notes - Exploratory Realization)  
**Constrained By**:

- [use-case.md](./use-case.md) (Intent)
- [requirements.md](./requirements.md) (Obligations)
- [constraints.md](./constraints.md) (Non-negotiables)
- [api-contract.md](./api-contract.md) (External Behavior)

**Last Updated**: 2026-02-03  
**Author**: LinCie
