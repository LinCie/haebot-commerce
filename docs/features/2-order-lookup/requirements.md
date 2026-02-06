# Order Lookup - Requirements

## Feature Overview

Order lookup is a guest-accessible feature that allows users to check their order status without requiring a user account or logging in. Users provide their transaction number and the last 4 digits of their phone number to verify ownership and view order details.

---

## Document Authority

This document is constrained by [use-cases.md](./use-cases.md). All requirements must align with the intent expressed in the use-cases document.

---

## Functional Requirements

### FR-1: Order Lookup Validation

**Requirement**: The system must provide a two-step lookup process where users first validate their credentials, then fetch order details.

**Details**:

- Users must provide a transaction number (case-sensitive string)
- Users must provide the last 4 digits of their phone number (exactly 4 digits)
- Validation occurs on form submission only
- Upon successful validation, the API returns an order ID
- The frontend must then fetch order details using the returned ID
- Order data is displayed inline on the same page (no redirect)

**Traceability**: UC-1, UC-2, UC-3

### FR-2: Transaction Number Input

**Requirement**: The transaction number input must accept case-sensitive string values.

**Details**:

- Input type: text
- Case sensitivity: preserved
- No length constraints enforced on frontend
- Validation: Must be non-empty after trimming

**Traceability**: UC-1

### FR-3: Phone Digits Input

**Requirement**: The phone digits input must accept exactly 4 numeric digits.

**Details**:

- Input type: text (numeric keyboard on mobile)
- Length: exactly 4 characters
- Character set: digits 0-9 only
- Validation: Must be exactly 4 digits
- No formatting characters allowed (spaces, dashes, etc.)

**Traceability**: UC-1

### FR-4: Order Data Display

**Requirement**: Upon successful lookup, the system must display order information inline.

**Details**:

- Display format: Inline expansion on the same page
- Data fetched separately via order ID returned from lookup
- If order has no products: redirect away (error state)
- If order has products: display order details

**Traceability**: UC-1, UC-2, UC-3

### FR-5: Support for All Transaction Statuses

**Requirement**: Order lookup must work for all transaction statuses.

**Supported Statuses**:

- TX_DRAFT
- TX_READY
- TX_SENT
- TX_RECEIVED
- TX_COMPLETED
- TX_CANCELED
- TX_RETURN
- TX_CLOSED

**Traceability**: UC-1, UC-2, UC-3

---

## Data Requirements

### DR-1: Order Response Schema

**Requirement**: The order data returned must include only non-sensitive information.

**Required Fields**:

| Field      | Type   | Description                                    |
| ---------- | ------ | ---------------------------------------------- |
| number     | string | Transaction number                             |
| status     | enum   | Transaction status (one of supported statuses) |
| timestamps | object | Order timestamps (optional, nullable)          |
| details    | array  | Array of order line items (optional)           |

**Traceability**: UC-1, Security & Privacy section

### DR-2: Product Information

**Requirement**: Each product in the order details must display essential information.

**Required Product Fields**:

| Field    | Type   | Description      |
| -------- | ------ | ---------------- |
| name     | string | Product name     |
| quantity | number | Quantity ordered |
| price    | number | Unit price       |

**Optional Fields** (may be displayed if available):

- sku: string
- item.name: string (from nested item object)
- item.sku: string (from nested item object)

**Traceability**: UC-1

### DR-3: Timestamp Display

**Requirement**: All timestamps must be displayed in a user-friendly format.

**Required Timestamps**:

| Timestamp   | Display Rule       |
| ----------- | ------------------ |
| createdAt   | Display if present |
| packagedAt  | Display if present |
| shippedAt   | Display if present |
| deliveredAt | Display if present |
| cancelledAt | Display if present |
| completedAt | Display if present |

**Display Rules**:

- If timestamps object is null/undefined: hide entire timestamp section
- If specific timestamp is null: hide that specific timestamp
- Format: User-friendly date/time format (e.g., "January 15, 2024 at 2:30 PM")

**Traceability**: UC-1, UC-3

### DR-4: Data Exclusion

**Requirement**: The following data MUST NOT be displayed in order lookup results.

**Excluded Fields**:

- Customer personal information (name, email, full phone number)
- Shipping address details
- Payment information
- Internal notes (sender_notes, receiver_notes, handler_notes)
- Transaction fees
- Attached files
- External links
- Handler/sender/receiver IDs and details
- Financial details (debit, credit, discount, weight)

**Traceability**: Security & Privacy section

### DR-5: Empty State Handling

**Requirement**: The system must handle empty or missing data gracefully.

**Rules**:

- No products: Redirect (treat as error)
- Missing timestamps object: Hide timestamp section entirely
- Individual null timestamp: Hide that specific timestamp only
- Empty product name: Display with fallback (e.g., "Unknown Product")

**Traceability**: UC-1

---

## Security Requirements

### SR-1: Generic Error Messages

**Requirement**: The system must display generic error messages that do not reveal which field was incorrect.

**Error Message (Indonesian)**:

> "Nomor transaksi atau nomor telepon tidak cocok. Silakan periksa kembali data yang Anda masukkan."

**Translation**:

> "Transaction number or phone number does not match. Please check the data you entered."

**Rationale**: Prevents information leakage that could be exploited for order enumeration.

**Traceability**: Error Handling section

### SR-2: No Session Persistence

**Requirement**: The system must not create or persist any session after lookup.

**Rules**:

- No cookies set
- No localStorage/sessionStorage used for auth
- Each lookup requires full re-authentication
- No automatic login or account linking

**Traceability**: Session Management section

### SR-3: No Rate Limiting

**Requirement**: Rate limiting is not required for this feature.

**Note**: This is a deliberate decision based on current threat assessment. Future versions may implement rate limiting if abuse is detected.

**Traceability**: Future Considerations

### SR-4: No Audit Logging

**Requirement**: Successful and failed lookup attempts do not need to be logged.

**Note**: This is a deliberate decision. Future versions may implement logging if required by compliance or security needs.

**Traceability**: Future Considerations

---

## Validation Requirements

### VR-1: Input Validation

**Requirement**: Form validation must occur on submission only.

**Validation Rules**:

| Field              | Rule                   | Error Behavior |
| ------------------ | ---------------------- | -------------- |
| Transaction Number | Non-empty after trim   | Fail lookup    |
| Phone Digits       | Exactly 4 digits (0-9) | Fail lookup    |

**Note**: Empty or whitespace-only inputs cause lookup to fail with generic error message.

**Traceability**: UC-1

### VR-2: Phone Digits Format

**Requirement**: Phone digits input must strictly enforce numeric format.

**Rules**:

- Input must be exactly 4 characters
- Each character must be a digit (0-9)
- No spaces, dashes, or other formatting allowed
- Frontend validation should prevent non-numeric input if possible

**Traceability**: UC-1

### VR-3: Backend Validation

**Requirement**: Phone number matching is performed by the backend.

**Note**: Frontend is not responsible for phone validation logic. The backend matches the provided 4 digits against the stored phone number.

**Traceability**: UC-1

---

## Error Handling Requirements

### EHR-1: Validation Error Display

**Requirement**: Validation errors must be displayed via sonner toast notifications.

**Details**:

- Component: sonner notification library
- Type: Toast notification
- Duration: Standard toast duration
- Position: Default toast position

**Traceability**: Error Handling section

### EHR-2: Network Error Handling

**Requirement**: Network errors must be displayed to the user.

**Details**:

- Display generic network error message via toast
- Allow immediate retry
- No cooldown period required

**Traceability**: Error Handling section

### EHR-3: Timeout Handling

**Requirement**: API timeouts must be handled as network errors.

**Details**:

- Timeout threshold: 30 seconds maximum
- On timeout: Display network error message
- Allow immediate retry

**Traceability**: Error Handling section

### EHR-4: No Retry Cooldown

**Requirement**: Users may retry immediately after any failure.

**Note**: No artificial delays or cooldowns between attempts.

**Traceability**: Error Handling section

---

## UI/UX Requirements

### UR-1: Form Layout

**Requirement**: The lookup form must have clear labels and placeholders.

**Required Elements**:

- Transaction Number field with label
- Phone Digits field with label
- Submit button
- Clear visual hierarchy

**Traceability**: UC-1

### UR-2: Loading States

**Requirement**: Loading states must provide clear feedback during lookup.

**Details**:

- Disable all form inputs during lookup
- Show loading state on submit button
- Prevent duplicate submissions

**Traceability**: UC-1

### UR-3: Mobile Responsiveness

**Requirement**: The form must fit within mobile screen dimensions.

**Details**:

- Form must not exceed mobile viewport width
- Touch-friendly input sizes
- Responsive layout that adapts to screen size

**Traceability**: Usage Contexts section

### UR-4: Accessibility

**Requirement**: The feature must be accessible to users with disabilities.

**Requirements**:

- WCAG 2.1 Level AA compliance
- Proper ARIA labels on form inputs
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast

**Traceability**: Acceptance Criteria

---

## API Integration Requirements

### AIR-1: Lookup Endpoint

**Requirement**: Order lookup uses the `trades/lookup` endpoint.

**Endpoint**: `POST trades/lookup`

**Request Body**:

```json
{
  "number": "string",
  "phone": "string"
}
```

**Success Response**:

```json
{
  "id": number,
  "success": true
}
```

**Failure Response**:

```json
{
  "success": false
}
```

**Traceability**: Technical Implementation

### AIR-2: Order Fetch Endpoint

**Requirement**: After successful lookup, fetch order details using the returned ID.

**Endpoint**: `GET trades/{id}`

**Authentication**: BACKEND_API_KEY from environment variables

**Response Schema**: See DR-1 (Order Response Schema)

**Traceability**: Technical Implementation

### AIR-3: Authentication

**Requirement**: API calls must include proper authentication.

**Details**:

- Token: BACKEND_API_KEY from environment variables
- Passed in request context
- Read inside action handlers, not exposed to client

**Traceability**: Integration Requirements

---

## Performance Requirements

### PR-1: Response Time

**Requirement**: Lookup requests must complete within acceptable time limits.

**Maximum Response Time**: 30 seconds

**Target Response Time**: < 3 seconds

**Traceability**: Performance Requirements

### PR-2: Client-Side Caching

**Requirement**: Lookup results may be cached client-side.

**Details**:

- Caching is optional
- If implemented: use average/standard caching duration
- Cache key: transaction number + phone digits hash
- Invalidate on page refresh

**Traceability**: Performance Requirements

### PR-3: No Concurrent Request Restrictions

**Requirement**: Multiple simultaneous lookups from the same IP are allowed.

**Note**: No restrictions on concurrent requests.

**Traceability**: Performance Requirements

---

## Edge Case Requirements

### ECR-1: Deleted or Archived Orders

**Requirement**: Deleted or archived orders should not be displayed.

**Behavior**: If an order is deleted or archived, the lookup should fail with the generic error message.

**Traceability**: Edge Cases

### ECR-2: Test Transactions

**Requirement**: Test transactions should not be displayed through order lookup.

**Behavior**: Test orders should fail lookup with generic error message.

**Traceability**: Edge Cases

### ECR-3: Invalid Order IDs

**Requirement**: Invalid or non-existent order IDs must be handled gracefully.

**Behavior**: Display generic error message

**Traceability**: Error Handling

---

## Integration with Other Features

### IFR-1: Checkout History Separation

**Requirement**: Order lookup and checkout history are separate features.

**Details**:

- Checkout history is created at purchase finalization
- Order lookup is strictly for looking up existing orders
- No data sharing between the two features
- Lookup does not populate or modify checkout history

**Traceability**: Integration Requirements

---

## Acceptance Criteria

### AC-1: Successful Lookup

**Given**: A user has a valid transaction number and phone digits
**When**: The user submits the lookup form
**Then**: The order details are displayed inline with products and timestamps

### AC-2: Failed Lookup

**Given**: A user enters invalid transaction number or phone digits
**When**: The user submits the lookup form
**Then**: A generic error message is displayed via toast notification

### AC-3: Empty Order

**Given**: A user successfully validates but the order has no products
**When**: The system attempts to display the order
**Then**: The user is redirected (error state)

### AC-4: Mobile Experience

**Given**: A user accesses order lookup on a mobile device
**When**: The page loads and the user interacts with the form
**Then**: The form fits within the screen and is touch-friendly

### AC-5: Accessibility

**Given**: A user with assistive technology accesses the feature
**When**: The user navigates and submits the form
**Then**: All elements are accessible via keyboard and screen reader

---

## Success Metrics

### SM-1: Support Ticket Reduction

**Metric**: Reduction in support tickets related to order status inquiries

**Target**: Measurable decrease in "where is my order" type tickets

**Measurement**: Compare ticket volume before and after feature launch

**Traceability**: Business Value section

---

## Future Considerations

### FC-1: Rate Limiting

**Note**: Rate limiting may be implemented in future versions if abuse is detected.

### FC-2: Audit Logging

**Note**: Security audit logging may be added for compliance requirements.

### FC-3: Recovery Path

**Note**: A feature to recover lost transaction numbers is planned as part of checkout history.

---

## Traceability Matrix

| Requirement | Use Case            | Priority |
| ----------- | ------------------- | -------- |
| FR-1        | UC-1, UC-2, UC-3    | High     |
| FR-2        | UC-1                | High     |
| FR-3        | UC-1                | High     |
| FR-4        | UC-1, UC-2, UC-3    | High     |
| FR-5        | UC-1, UC-2, UC-3    | High     |
| DR-1        | UC-1                | High     |
| DR-2        | UC-1                | High     |
| DR-3        | UC-1, UC-3          | Medium   |
| DR-4        | Security            | High     |
| DR-5        | UC-1                | Medium   |
| SR-1        | Security            | High     |
| SR-2        | Security            | High     |
| VR-1        | UC-1                | High     |
| VR-2        | UC-1                | High     |
| EHR-1       | Error Handling      | High     |
| EHR-2       | Error Handling      | Medium   |
| EHR-3       | Error Handling      | Medium   |
| UR-1        | UC-1                | Medium   |
| UR-2        | UC-1                | Medium   |
| UR-3        | Usage Contexts      | Medium   |
| UR-4        | Acceptance Criteria | High     |
| AIR-1       | Technical           | High     |
| AIR-2       | Technical           | High     |
| AIR-3       | Technical           | High     |
| PR-1        | Performance         | Medium   |
| AC-1        | UC-1                | High     |
| AC-2        | UC-1                | High     |
| SM-1        | Business Value      | Medium   |

---

_Document Authority: This document defines obligations derived from use-cases.md. All implementation must satisfy these requirements._
