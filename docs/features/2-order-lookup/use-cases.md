# Order Lookup - Use Cases

## Feature Overview

Order lookup is a guest-accessible feature that allows users to check their order status without requiring a user account or logging in. Users provide their transaction number and the last 4 digits of their phone number to verify ownership and view order details.

This feature addresses the common need for customers to quickly check order status, particularly when accessing from different devices or browsers where they may not be logged in.

---

## Primary Actors

### Primary Actor

- **Customer/Guest User** - Individuals who have made a purchase and want to check their order status

### Secondary Actor

- **Cross-Device User** - Customers accessing their order information from a different device or browser than where the purchase was made

---

## Use Cases

### UC-1: Check Order Status

**Actor:** Customer/Guest User

**Trigger:** User wants to verify the current status of their purchase or check delivery progress

**Preconditions:**

- User has completed a purchase
- User has access to their transaction number (provided via WhatsApp or shown at checkout completion)
- User knows the last 4 digits of the phone number used during purchase

**Flow:**

1. User navigates to the order lookup page
2. User enters the transaction number in the designated field
3. User enters the last 4 digits of their phone number
4. User submits the lookup request
5. System validates the provided information against the order database
6. If validation succeeds, system displays order details
7. User views the order information (products ordered and timestamps)

**Postconditions:**

- User has viewed the order status
- No session is created or persisted
- Subsequent access requires re-entering credentials

**Visible Information:**

- Products that were ordered
- Order timestamps (createdAt, packagedAt, shippedAt, deliveredAt, cancelledAt, completedAt)

---

### UC-2: Verify Purchase from Different Device

**Actor:** Customer

**Trigger:** User wants to check their order status on a different device or browser where they are not logged in

**Preconditions:**

- Same as UC-1
- User is not logged into their account on the current device/browser

**Flow:**

- Same flow as UC-1

**Postconditions:**

- Same as UC-1

---

### UC-3: Confirm Cancellation Status

**Actor:** Customer

**Trigger:** User wants to verify whether their order has been cancelled

**Preconditions:**

- Same as UC-1

**Flow:**

- Same flow as UC-1

**Postconditions:**

- User confirms the cancellation status of their order
- User can see the cancelledAt timestamp if applicable

---

## Business Value

### Primary Benefit

**Reduced Support Ticket Volume** - By providing self-service order status checking, customers can independently verify their order status without contacting customer service, reducing the workload on support staff.

### Secondary Benefits

- **Improved Customer Experience** - Quick access to order information increases customer satisfaction
- **Trust Building** - Transparent order tracking builds confidence in the purchasing process
- **Accessibility** - Enables order checking without account creation or login barriers

---

## Security & Privacy

### Authentication Method

**Phone Number Verification (Last 4 Digits)**

- Chosen because it is the easiest piece of information for users to remember
- Provides a lightweight authentication layer better than unrestricted lookup
- Sufficient for verifying order ownership without requiring full account credentials

### Data Exposure Policy

**Visible Data:**

- Products ordered (name, quantity, price)
- Order timestamps (createdAt, packagedAt, shippedAt, deliveredAt, cancelledAt, completedAt)

**Hidden Data:**

- Full customer information (name, email, complete phone number)
- Shipping address details
- Payment information
- Internal notes (sender_notes, receiver_notes, handler_notes)
- Transaction fees and financial details
- Attached files and links

### Session Management

- **One-time view only** - No session persistence after lookup
- Each access requires re-authentication with transaction number and phone digits
- No tracking or history of lookup attempts

### Access Control

- **Guest-only feature** - No integration with user accounts
- Available to anyone with the correct transaction number and phone digits
- No distinction between registered users and guest users

---

## Error Handling

### API Response Limitation

The order lookup API returns only a boolean `success` field:

- `success: true` - Lookup validated, order details returned
- `success: false` - Lookup failed (invalid transaction number or phone digits)

### User-Friendly Error Messages

Since the API does not distinguish between error types, a single generic error message is displayed:

**Error Message (Indonesian):**

> "Nomor transaksi atau nomor telepon tidak cocok. Silakan periksa kembali data yang Anda masukkan."

**Translation:**

> "Transaction number or phone number does not match. Please check the data you entered."

### Display Method

- Error messages are displayed via the sonner notification component
- Messages appear as toast notifications for immediate user feedback

### Security Consideration

The generic error message intentionally does not reveal which specific field was incorrect:

- Does not confirm whether a transaction number exists
- Does not indicate if the phone digits were wrong
- Prevents information leakage that could be exploited for order enumeration

---

## Visible Order Statuses

The following transaction statuses from the checkout module schema are visible through order lookup:

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

---

## Future Considerations

### Known Limitations

1. **No Recovery Path for Lost Transaction Numbers** - Users who lose their transaction number have no way to recover it through this feature
2. **No Rate Limiting** - Currently no protection against brute force attempts to guess transaction numbers
3. **No Action Capabilities** - Users cannot perform actions (cancel order, request refund, contact support) directly from the lookup result

### Planned Improvements

- **Checkout History Feature** - A future feature will allow users to view their order history, which will mitigate the lost transaction number problem
- This feature will provide an alternative way for users to access their order information

### Integration Notes

- Order lookup operates as a standalone feature
- No direct integration with notification systems, order history, or support workflows
- Future integrations may be considered based on user feedback and business needs

---

## Usage Contexts

### Supported Devices

Order lookup is accessible from any web browser on any device (desktop, tablet, mobile).

### Typical Usage Scenarios

1. **Post-Purchase Verification** - Customer checks order immediately after purchase confirmation
2. **Delivery Tracking** - Customer checks shipping status while waiting for delivery
3. **Cross-Device Access** - Customer checks order from work computer or friend's device
4. **Cancellation Confirmation** - Customer verifies order cancellation was processed

### Transaction Number Sources

Users obtain their transaction number from:

- WhatsApp message sent after successful purchase
- Checkout completion page displayed immediately after payment
- Future: Checkout history feature (planned)

---

_Document Authority: This is the highest-authority document for the order lookup feature. All other documentation (requirements, constraints, API contracts, technical notes) must align with the intent expressed here._
