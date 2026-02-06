# Order Lookup - API Contract

## Overview

This document defines the external API contract for the Order Lookup feature. It specifies the endpoints, request/response formats, authentication requirements, and error handling that API consumers can rely on.

**Document Authority:**

This document is constrained by:

1. [use-cases.md](./use-cases.md) - Intent and business logic
2. [requirements.md](./requirements.md) - Functional and non-functional obligations
3. [constraints.md](./constraints.md) - Non-negotiable technical constraints

---

## Base URL

All API endpoints are relative to the backend base URL:

```
{BACKEND_URL}/
```

**Default:** `http://localhost:8000` (development)

**Environment Variable:** `BACKEND_URL`

---

## Authentication

### Method

All API requests require Bearer token authentication using the `BACKEND_API_KEY`.

### Token Source

- **Source:** Environment variable `BACKEND_API_KEY`
- **Location:** Server-side only (never exposed to client)
- **Header:** `Authorization: Bearer {BACKEND_API_KEY}`

### Security Note

> **CRITICAL:** The `BACKEND_API_KEY` must never be exposed to client-side code. All API calls should be made through server-side actions or API routes.

---

## Endpoints

### 1. Order Lookup Validation

Validates order ownership using transaction number and phone digits.

**Endpoint:** `POST /trades/lookup`

**HTTP Method:** POST (chosen over GET to prevent credential exposure in query parameters and URL logs)

#### Request

**Content-Type:** `application/json`

**Body Schema:**

```typescript
{
  number: string; // Transaction number (case-sensitive)
  phone: string; // Last 4 digits of phone number (digits only)
}
```

**Field Details:**

| Field  | Type   | Required | Constraints                           |
| ------ | ------ | -------- | ------------------------------------- |
| number | string | Yes      | Case-sensitive, no length limit       |
| phone  | string | Yes      | Exactly 4 digits (0-9), no formatting |

**Example Request:**

```json
{
  "number": "TXN-2024-001234",
  "phone": "1234"
}
```

#### Response

**Success Response (200 OK):**

```json
{
  "id": 12345,
  "success": true
}
```

**Field Details:**

| Field   | Type    | Description                             |
| ------- | ------- | --------------------------------------- |
| id      | number  | Order ID to use for fetching details    |
| success | boolean | Always `true` for successful validation |

**Failure Response (200 OK):**

```json
{
  "success": false
}
```

> **Note:** The API returns HTTP 200 even for failed validations. The `success` field indicates the validation result. This is intentional to prevent information leakage about which field was incorrect.

**Field Details:**

| Field   | Type    | Description                          |
| ------- | ------- | ------------------------------------ |
| success | boolean | Always `false` for failed validation |

---

### 2. Fetch Order Details

Retrieves order details using the order ID returned from successful lookup.

**Endpoint:** `GET /trades/{id}`

**HTTP Method:** GET

#### Request

**Path Parameters:**

| Parameter | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| id        | number | Yes      | Order ID from lookup |

**Example Request:**

```
GET /trades/12345
```

#### Response

**Success Response (200 OK):**

```json
{
  "number": "TXN-2024-001234",
  "status": "TX_SENT",
  "timestamps": {
    "createdAt": "2024-01-15T08:30:00Z",
    "packagedAt": "2024-01-15T10:00:00Z",
    "shippedAt": "2024-01-15T14:00:00Z",
    "deliveredAt": null,
    "cancelledAt": null,
    "completedAt": null
  },
  "details": [
    {
      "id": 1,
      "model_type": "product",
      "sku": "PROD-001",
      "name": "Wireless Headphones",
      "quantity": 2,
      "price": 150000,
      "discount": 0,
      "weight": 0.5,
      "debit": 0,
      "credit": 0,
      "notes": null,
      "item": {
        "id": 101,
        "name": "Wireless Headphones",
        "sku": "PROD-001",
        "cost": "100000",
        "price": "150000"
      }
    }
  ]
}
```

**Response Schema:**

| Field      | Type   | Required | Description                                   |
| ---------- | ------ | -------- | --------------------------------------------- |
| number     | string | Yes      | Transaction number                            |
| status     | enum   | Yes      | Transaction status (see Status Enum below)    |
| timestamps | object | No       | Order timestamps (null for test transactions) |
| details    | array  | No       | Array of order line items                     |

**Status Enum:**

| Status       | Description                         |
| ------------ | ----------------------------------- |
| TX_DRAFT     | Order in draft state                |
| TX_REQUEST   | Order has been requested            |
| TX_READY     | Order is ready for processing       |
| TX_SENT      | Order has been sent/dispatched      |
| TX_RECEIVED  | Order has been received by customer |
| TX_COMPLETED | Order has been completed            |
| TX_CANCELED  | Order has been cancelled            |
| TX_RETURN    | Order is being returned             |
| TX_CLOSED    | Order has been closed               |

**Timestamps Schema:**

| Field       | Type   | Nullable | Description              |
| ----------- | ------ | -------- | ------------------------ |
| createdAt   | string | Yes      | Order creation timestamp |
| packagedAt  | string | Yes      | Packaging timestamp      |
| shippedAt   | string | Yes      | Shipping timestamp       |
| deliveredAt | string | Yes      | Delivery timestamp       |
| cancelledAt | string | Yes      | Cancellation timestamp   |
| completedAt | string | Yes      | Completion timestamp     |

**Order Detail Schema:**

| Field      | Type   | Required | Description                    |
| ---------- | ------ | -------- | ------------------------------ |
| id         | number | Yes      | Detail item ID                 |
| model_type | string | Yes      | Type of item (e.g., "product") |
| sku        | string | Yes      | Product SKU                    |
| name       | string | Yes      | Product name                   |
| quantity   | number | Yes      | Quantity ordered               |
| price      | number | Yes      | Unit price                     |
| discount   | number | Yes      | Discount amount                |
| weight     | number | Yes      | Item weight                    |
| debit      | number | Yes      | Debit amount                   |
| credit     | number | Yes      | Credit amount                  |
| notes      | string | No       | Optional notes                 |
| item       | object | No       | Nested item information        |

**Item Schema (nested in details):**

| Field | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| id    | number | Yes      | Item ID     |
| name  | string | Yes      | Item name   |
| sku   | string | Yes      | Item SKU    |
| cost  | string | Yes      | Item cost   |
| price | string | Yes      | Item price  |

---

## Error Handling

### HTTP Status Codes

| Status Code     | Scenario                                       |
| --------------- | ---------------------------------------------- |
| 200 OK          | Request processed successfully                 |
| 400 Bad Request | Malformed request body                         |
| 403 Forbidden   | Authentication failure (invalid/missing token) |
| 404 Not Found   | Order not found (for GET /trades/{id})         |

### Error Response Format

For non-200 responses, the API returns:

```json
{
  "message": "Error description",
  "issues": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Field-specific error message",
      "path": ["fieldName"]
    }
  ]
}
```

### Lookup Validation Errors

> **IMPORTANT:** The lookup endpoint (`POST /trades/lookup`) intentionally returns generic error messages without distinguishing between:
>
> - Invalid transaction number
> - Incorrect phone digits
> - Non-existent order

**Error Message (Indonesian):**

```
Nomor transaksi atau nomor telepon tidak cocok. Silakan periksa kembali data yang Anda masukkan.
```

**Translation:**

```
Transaction number or phone number does not match. Please check the data you entered.
```

This generic message prevents information leakage that could be exploited for order enumeration attacks.

### Network Errors

**Timeout:** 30 seconds maximum (hard constraint)

If a request times out, it should be treated as a network error. The client may retry immediately.

---

## Data Exposure Policy

### Visible Data

The following data is exposed through the order lookup API:

- Transaction number
- Transaction status
- Order timestamps (createdAt, packagedAt, shippedAt, deliveredAt, cancelledAt, completedAt)
- Product information (name, SKU, quantity, price)
- Item details (name, SKU, cost, price)

### Hidden Data

The following data is **NEVER** exposed:

- Customer personal information (name, email, full phone number)
- Shipping address details
- Payment information
- Internal notes (sender_notes, receiver_notes, handler_notes)
- Transaction fees
- Attached files
- External links
- Handler/sender/receiver IDs and details
- Financial details (debit, credit, discount, weight) - visible in schema but not displayed in UI

---

## Integration Workflow

### Two-Step Lookup Process

```
┌─────────────────┐     POST /trades/lookup     ┌─────────────────┐
│   User Input    │ ───────────────────────────> │   Validation    │
│  (number, phone)│                              │                 │
└─────────────────┘                              └─────────────────┘
                                                        │
                              success: true             │ success: false
                              {id: 12345}               │ {success: false}
                                │                       │
                                ▼                       ▼
                    ┌─────────────────────┐    ┌─────────────────┐
                    │ GET /trades/{id}    │    │  Display Error  │
                    │ Fetch Order Details │    │  (Generic Msg)  │
                    └─────────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │  Display Order Info │
                    │  (Products, Status) │
                    └─────────────────────┘
```

### Implementation Notes

1. **Step 1:** Call `POST /trades/lookup` with transaction number and phone digits
2. **Step 2:** If `success: true`, extract the `id` field
3. **Step 3:** Call `GET /trades/{id}` to fetch order details
4. **Step 4:** Display order information to the user

**Important:** If the order fetch fails after successful lookup, the entire lookup operation should be treated as failed.

---

## Constraints & Limitations

### Hard Constraints

| Constraint          | Value         | Description                              |
| ------------------- | ------------- | ---------------------------------------- |
| Response Structure  | Immutable     | Discriminated union format cannot change |
| HTTP Methods        | Fixed         | POST for lookup, GET for fetch           |
| Timeout             | 30 seconds    | Maximum request duration                 |
| Phone Verification  | Last 4 digits | Only last 4 digits used for verification |
| Session Persistence | None          | No cookies, localStorage, or sessions    |
| Error Messages      | Generic only  | No field-specific error messages         |
| Data Exposure       | Restricted    | Personal/financial data never exposed    |
| Accessibility       | WCAG 2.1 AA   | Must meet accessibility standards        |

### Supported Transaction Statuses

All transaction statuses are supported without exception:

- TX_DRAFT
- TX_REQUEST
- TX_READY
- TX_SENT
- TX_RECEIVED
- TX_COMPLETED
- TX_CANCELED
- TX_RETURN
- TX_CLOSED

### Rate Limiting

**Current:** No rate limiting is implemented.

**Future:** Rate limiting may be introduced if abuse is detected. Implementation will not require breaking changes.

### Concurrent Requests

Multiple simultaneous lookup requests from the same IP are allowed. No throttling or queueing is implemented.

---

## Versioning

**Current Version:** No versioning (v0)

**Versioning Strategy:** URL-based versioning will be used for future breaking changes:

```
/v1/trades/lookup
/v2/trades/lookup
```

**Backward Compatibility:** The current discriminated union response structure (TC-1) must not be modified without a version bump.

---

## Edge Cases

### Test Transactions

Test transactions are identified by the absence of timestamp data (null/undefined timestamps object). These should fail lookup with a generic error message.

### Deleted/Archived Orders

Deleted or archived orders immediately fail lookup with a generic error message. No distinction is made between "never existed" and "was deleted."

### Empty Orders

Orders with no products should display an empty state inline, showing order metadata (number, status) without redirecting to an error page.

### Malformed Requests

Requests with extra fields in the body will have those fields removed by the backend. Only `number` and `phone` fields are processed.

---

## Examples

### Complete Success Flow

**Request 1 - Lookup:**

```http
POST /trades/lookup
Authorization: Bearer {BACKEND_API_KEY}
Content-Type: application/json

{
  "number": "TXN-2024-001234",
  "phone": "5678"
}
```

**Response 1:**

```json
{
  "id": 12345,
  "success": true
}
```

**Request 2 - Fetch Details:**

```http
GET /trades/12345
Authorization: Bearer {BACKEND_API_KEY}
```

**Response 2:**

```json
{
  "number": "TXN-2024-001234",
  "status": "TX_SENT",
  "timestamps": {
    "createdAt": "2024-01-15T08:30:00Z",
    "packagedAt": "2024-01-15T10:00:00Z",
    "shippedAt": "2024-01-15T14:00:00Z",
    "deliveredAt": null,
    "cancelledAt": null,
    "completedAt": null
  },
  "details": [
    {
      "id": 1,
      "model_type": "product",
      "sku": "PROD-001",
      "name": "Wireless Headphones",
      "quantity": 2,
      "price": 150000,
      "discount": 0,
      "weight": 0.5,
      "debit": 0,
      "credit": 0,
      "notes": null,
      "item": {
        "id": 101,
        "name": "Wireless Headphones",
        "sku": "PROD-001",
        "cost": "100000",
        "price": "150000"
      }
    }
  ]
}
```

### Failed Lookup Example

**Request:**

```http
POST /trades/lookup
Authorization: Bearer {BACKEND_API_KEY}
Content-Type: application/json

{
  "number": "INVALID-NUMBER",
  "phone": "0000"
}
```

**Response:**

```json
{
  "success": false
}
```

**User Message:**

```
Nomor transaksi atau nomor telepon tidak cocok. Silakan periksa kembali data yang Anda masukkan.
```

### Empty Order Example

```json
{
  "number": "TXN-2024-001235",
  "status": "TX_DRAFT",
  "timestamps": {
    "createdAt": "2024-01-15T09:00:00Z",
    "packagedAt": null,
    "shippedAt": null,
    "deliveredAt": null,
    "cancelledAt": null,
    "completedAt": null
  },
  "details": []
}
```

---

## Testing & Development

### Environment Setup

Required environment variables:

```bash
BACKEND_URL=http://localhost:8000
BACKEND_API_KEY=your_api_key_here
```

### No Test Endpoints

There are no dedicated test or sandbox environments. Use the production API with test data for development.

### No Test Data

No specific test data is provided. Create test orders through the normal checkout flow for testing.

---

## Changelog

| Version | Date       | Changes              |
| ------- | ---------- | -------------------- |
| 1.0.0   | 2024-XX-XX | Initial API contract |

---

_Document Authority: This document defines the external API behavior for the order lookup feature. All implementation must satisfy the constraints documented here and in higher-authority documents (use-cases.md, requirements.md, constraints.md)._
