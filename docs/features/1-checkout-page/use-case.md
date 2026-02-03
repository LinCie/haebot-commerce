# Checkout Page - Use Cases

## Overview

The checkout page enables customers to complete their purchase by providing necessary information for order fulfillment. Upon successful checkout, customers are redirected to WhatsApp with a pre-filled message containing their order details.

---

## Primary Use Case: Customer Checkout Flow

### Actors

- **End Customer**: User making a purchase

### Prerequisites

- Customer has items in their shopping cart
- Cart contains valid products with quantities

### Flow

1. **Cart Review**
   - Customer reviews items in cart page (`/keranjang`)
   - Customer clicks checkout button
   - System navigates to checkout page

2. **Information Collection**
   - Checkout page displays order summary
   - Customer provides required information:
     - Customer name/contact
     - Delivery address
     - Additional notes (optional)

3. **Transaction Creation (Backend - Batch Operation)**

   The system executes a single batch operation request containing:

   **Operation 1: Create Transaction**

   ```typescript
   {
     type: "create",
     ref: "tx-main",
     data: {
       space_id: <space_id>,
   ```

4. **Cart Review**
   - Customer reviews items in cart page (`/keranjang`)
   - Customer clicks checkout button
   - System navigates to checkout page

5. **Information Collection**
   - Checkout page displays order summary
   - Customer provides required information:
     - Customer name/contact
     - Delivery address
     - Additional notes (optional)

6. **Transaction Creation (Backend - Batch Operation)**

   The system executes a single batch operation request containing:

   **Operation 1: Create Transaction**

   ```typescript
   {
     type: "create",
     ref: "tx-main",
     data: {
       space_id: <space_id>,
       // Minimal initial data
     }
   }
   ```

   **Operation 2: Update Transaction with Customer Info**

   ```typescript
   {
     type: "update",
     idRef: "tx-main",
     data: {
       receiver_notes: "<all_customer_information>"
       // Format: "Name: <name>\nPhone: <phone>\nAddress: <address>\nNotes: <notes>"
       // sender_notes and handler_notes remain empty
     }
   }
   ```

   **Operation 3+: Create Transaction Details (one per cart item)**

   ```typescript
   {
     type: "createDetail",
     transactionIdRef: "tx-main",
     data: {
       item_id: <product_id>,
       model_type: "SO", // Always Sales Order
       quantity: <quantity>,
       price: <product_price>,
       discount: 0,
       sku: "<product_sku>",
       name: "<product_name>"
     }
   }
   ```

7. **Success & Redirect**
   - Transaction created with status: `TX_DRAFT`
   - System generates WhatsApp message template with:
     - Order number
     - Product list (name, quantity, price)
     - Total amount
     - Customer information
   - Customer redirected to WhatsApp with pre-filled message
   - Cart is cleared

### Success Criteria

- Transaction successfully created with all items
- Customer information captured in transaction notes
- WhatsApp redirect executed with complete order details
- Shopping cart cleared

### Error Scenarios

- **Invalid Cart Items**: Product no longer available or insufficient stock
- **Network Error**: Batch operation failed
- **Validation Error**: Missing required customer information

---

## Transaction Detail Type

### Sales Order (SO)

- **Purpose**: Represents customer purchase orders
- **Usage**: Default and only type used in checkout flow
- **Fields**:
  - `item_id`: Product identifier
  - `model_type`: Always set to `"SO"`
  - `quantity`: Number of units ordered
  - `price`: Unit price at time of order
  - `discount`: Applied discount amount (default: 0)
  - `weight`: Product weight for shipping calculation
  - `sku`: Product SKU
  - `name`: Product name
  - `notes`: Additional line item notes

---

## Transaction Status Lifecycle

### Current Implementation

- **TX_DRAFT**: Default status for newly created checkout transactions
  - Indicates order has been placed but not yet processed by store crew
  - All customer checkouts start in this state

### Future States (Not Currently Used)

- TX_REQUEST, TX_READY, TX_SENT, TX_RECEIVED, TX_COMPLETED, TX_CANCELED, TX_RETURN, TX_CLOSED

---

## Integration Points

### Cart Module

- **Input**: Cart items from `cart.store.ts` (id, quantity)
- **Action**: Fetch product details via `useCartProducts` hook
- **Trigger**: Checkout button in cart page

### WhatsApp Integration

- **Message Template Format**:

  ```
  Halo! Saya ingin memesan:

  [Order #<transaction_number>]

  ---
  <Product 1 Name> - <Qty> x Rp <Price>
  <Product 2 Name> - <Qty> x Rp <Price>
  ...
  ---

  Total: Rp <Total Amount>

  Informasi Pelanggan:
  <All customer information from receiver_notes>
  ```

- **Data Source**: Customer information extracted from `transaction.receiver_notes`

### Backend API

- **Endpoint**: `/trades/batch`
- **Authentication**: Backend API key token
- **Operation**: Single batch request with create + update + multiple createDetail operations

---

## Business Rules

1. **Transaction Creation**
   - All transactions must have a valid `space_id`
   - Transaction number auto-generated by backend
   - Default status is `TX_DRAFT`

2. **Transaction Details**
   - Each cart item creates a separate transaction detail
   - All details must have `model_type: "SO"`
   - Quantity must be positive integer
   - Price must be non-negative

3. **Customer Information**
   - All customer information stored in `receiver_notes` field:
     - Customer name
     - Phone number
     - Delivery address
     - Additional notes/instructions
   - Format: Structured text containing all customer details
   - `sender_notes` and `handler_notes` remain empty initially
   - Customer information is required for order fulfillment

4. **Batch Operation Constraints**
   - Maximum 100 operations per batch request
   - Use reference system (`ref`/`idRef`) for cross-operation dependencies
   - All operations execute atomically (all succeed or all fail)

---

## Non-Functional Requirements

### Performance

- Batch operation must complete within 5 seconds
- WhatsApp redirect should be instantaneous after successful checkout

### Reliability

- Failed batch operations should not clear the cart
- User should be notified of errors with actionable feedback
- Transaction should not be created if any operation fails

### User Experience

- Clear indication of processing state during checkout
- Success confirmation before WhatsApp redirect
- Error messages should guide user to resolution

---

## Future Considerations

### Multi-Step Checkout

- Payment method selection
- Shipping method options
- Order review/confirmation step

### Extended Transaction Types

- PO (Purchase Order) for B2B customers
- RTR (Return) for return requests
- Other transaction types as business expands

### Transaction Status Updates

- Move from TX_DRAFT to TX_REQUEST when order confirmed
- Status progression tracking for customers
- Admin interface for status management
