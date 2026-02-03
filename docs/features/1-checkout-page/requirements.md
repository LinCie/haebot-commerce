# Checkout Page - Requirements

## 1. Functional Requirements

### 1.1 Page Access & Navigation

**FR-1.1.1: Route**

- Checkout page accessible at `/bayar`
- Page must be server-rendered using Astro with React islands only when necessary

**FR-1.1.2: Empty Cart Protection**

- Checkout page must NOT be accessible if cart is empty
- Redirect to catalog page (`/katalog`) if cart is empty
- Show appropriate message on redirect

**FR-1.1.3: Navigation Options**

- Provide "Back to Catalog" button/link
- No "Back to Cart" option required

---

### 1.2 Customer Information Form

**FR-1.2.1: Required Form Fields**

| Field                 | Type        | Required | Validation                           |
| --------------------- | ----------- | -------- | ------------------------------------ |
| Full Name             | Text Input  | ✅ Yes   | Non-empty                            |
| Phone Number          | Text Input  | ✅ Yes   | Must start with `+62`, `62`, or `08` |
| Email                 | Email Input | ✅ Yes   | Valid email format                   |
| Address (Street)      | Text Input  | ✅ Yes   | Non-empty                            |
| Address (City)        | Text Input  | ✅ Yes   | Non-empty                            |
| Address (Province)    | Text Input  | ✅ Yes   | Non-empty                            |
| Address (Postal Code) | Text Input  | ✅ Yes   | Non-empty                            |
| Notes                 | Textarea    | ❌ No    | -                                    |

**FR-1.2.2: Field Validation Rules**

- No minimum or maximum character length constraints
- All special characters allowed
- Phone number format:
  - Valid: `+6281234567890`, `6281234567890`, `081234567890`
  - Invalid: `1234567890`, `+1234567890`
- Email: Standard email validation (contains `@` and domain)

**FR-1.2.3: Validation Timing**

- Validation occurs **on form submit only**
- No real-time validation
- No validation on field blur

**FR-1.2.4: Error Display**

- Validation errors displayed **inline below each field**
- Error message specific to validation failure
- Form remains populated with user input on error

**FR-1.2.5: Data Storage Format**
All customer information stored in `receiver_notes` field with format:

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

Each field separated by newline (`\n`)

---

### 1.3 Order Summary

**FR-1.3.1: Product Information Display**

Must display for each cart item:

- Product name
- Unit price (formatted as Rupiah)
- Quantity (with quantity modifier controls)
- Subtotal per item (quantity × unit price)

**FR-1.3.2: Order Total**

- Display grand total of all items
- Format as Rupiah currency

**FR-1.3.3: No Additional Costs**

- No shipping/delivery fee
- No tax calculation
- No discount codes
- No service charges

**FR-1.3.4: Quantity Modification**

- Users can modify item quantities directly on checkout page
- Quantity controls: increment (+), decrement (-), or direct input
- Minimum quantity: 1
- Maximum quantity: Product stock availability
- Subtotal and total update in real-time when quantity changes
- Quantity changes update cart store immediately

**FR-1.3.5: Product Data Fetching**

- Fetch fresh product data using batch read operation
- Same approach as cart page (`useCartProducts` pattern)
- Validate product availability and stock before checkout

---

### 1.4 Stock Validation

**FR-1.4.1: Stock Availability Check**

- Validate product stock before allowing checkout
- Same validation logic as cart page
- Show stock availability status for each product

**FR-1.4.2: Order Limitations**

- Minimum order quantity per product: 1
- Maximum order quantity per product: Available stock
- Out-of-stock products cannot be ordered
- If product becomes unavailable during checkout, show error

**FR-1.4.3: Price Validation**

- Fetch latest product prices via batch read
- Use fetched prices (not cached cart prices)
- No price change notification needed (always use latest)

---

### 1.5 Checkout Submission

**FR-1.5.1: Form Submission Process**

1. Validate all required fields
2. If validation fails: Show inline errors, do not submit
3. If validation passes:
   - Show loading state
   - Disable all form inputs
   - Disable checkout button
   - Execute batch transaction operation

**FR-1.5.2: Batch Transaction Composition**

Single batch operation containing:

1. **Create Transaction**

   ```typescript
   {
     type: "create",
     ref: "tx-main",
     data: {
       space_id: <from_backend_env>
     }
   }
   ```

2. **Update Transaction with Customer Info**

   ```typescript
   {
     type: "update",
     idRef: "tx-main",
     data: {
       receiver_notes: "<formatted_customer_info>"
     }
   }
   ```

3. **Create Transaction Details** (one per cart item)
   ```typescript
   {
     type: "createDetail",
     transactionIdRef: "tx-main",
     data: {
       item_id: <product_id>,
       model_type: "SO",
       quantity: <quantity>,
       price: <unit_price>,
       discount: 0,
       sku: <product_sku>,
       name: <product_name>
     }
   }
   ```

**FR-1.5.3: Transaction Configuration**

- `space_id`: Read from backend environment variable in Astro action
- Default status: `TX_DRAFT`
- `model_type`: Always `"SO"` (Sales Order) for all transaction details

**FR-1.5.4: Performance Requirements**

- Maximum checkout processing time: 30 seconds
- Show loading indicator during processing
- Timeout after 30 seconds with error message

---

### 1.6 Success Flow

**FR-1.6.1: Checkout Success Actions**

Upon successful batch transaction:

1. Store checkout result in checkout history store (persistent)
2. Clear shopping cart
3. Navigate to success page (`/bayar/sukses` or separate route)

**FR-1.6.2: Checkout History Store**

- Create persistent store for checkout history
- Store only transaction IDs (minimal storage)
- Enables batch read for latest transaction status on history page
- Store fields:
  - Transaction ID (number)
  - Timestamp (ISO string)
- Fetch full transaction details via batch read when needed
- Prevents data loss if user accidentally closes tab

**FR-1.6.3: Success Page Display**

Must show:

- Success message (e.g., "Pesanan Berhasil Dibuat!")
- Transaction number (from batch operation response)
- Order summary:
  - Product list (name, quantity, price, subtotal)
  - Total amount
- Customer information (from form)
- WhatsApp redirect button

**FR-1.6.4: Success Page Layout**

- Mobile-first design
- Clear visual confirmation of success
- Prominent WhatsApp redirect button

---

### 1.7 WhatsApp Integration

**FR-1.7.1: WhatsApp Business Number**

- Phone number: `6285246428746`

**FR-1.7.2: Message Format**

Use format from use-case.md:

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
Full Name: <value>
Phone: <value>
Email: <value>
Street: <value>
City: <value>
Province: <value>
Postal Code: <value>
Notes: <value>
```

**FR-1.7.3: Message Data Source**

- Transaction number: From batch operation response (`transaction.number`)
- Product details: From checkout store
- Customer info: From checkout store
- Format all prices as Indonesian Rupiah (Rp)

**FR-1.7.4: Redirect Mechanism**

- User clicks button on success page
- WhatsApp link format: `https://wa.me/6285246428746?text=<encoded_message>`
- URL-encode the message before redirect
- Open in new tab or redirect current tab

**FR-1.7.5: Redirect Failure Handling**

- If redirect fails: Show error toast
- Keep success page accessible
- User can retry redirect

---

### 1.8 Error Handling

**FR-1.8.1: Form Validation Errors**

- Display inline below each invalid field
- Error message examples:
  - "Nama lengkap harus diisi"
  - "Format nomor telepon tidak valid"
  - "Email tidak valid"
  - "Alamat harus diisi"

**FR-1.8.2: Batch Transaction Errors**

- Display error as toast notification
- Preserve all form data (do not clear)
- Re-enable form for retry
- Error message examples:
  - "Gagal membuat pesanan. Silakan coba lagi."
  - "Koneksi terputus. Periksa internet Anda."

**FR-1.8.3: Stock Validation Errors**

- If product out of stock during checkout:
  - Show error toast
  - Highlight affected products
  - Update cart to reflect current stock
  - Prevent checkout submission

**FR-1.8.4: Empty Cart Redirect**

- Redirect to `/katalog`
- Show info toast: "Keranjang kosong. Silakan pilih produk terlebih dahulu."

---

## 2. UI/UX Requirements

### 2.1 Page Layout

**UX-2.1.1: Design Priority**

- Mobile-first responsive design
- Optimize for mobile screens first
- Desktop layout as enhancement

**UX-2.1.2: Layout Structure (Desktop)**

- Two-column layout:
  - **Left**: Customer information form
  - **Right**: Order summary (sticky/fixed)
- Order summary always visible while scrolling form
- Page container: Maximum width `max-w-7xl` (Tailwind CSS ~80rem/1280px)
- Center-aligned container with horizontal padding

**UX-2.1.3: Layout Structure (Mobile)**

- Single-column layout:
  - Order summary at top (collapsible or always visible)
  - Customer information form below
- Stack elements vertically
- Page container: Maximum width `max-w-7xl` (Tailwind CSS ~80rem/1280px)
- Full-width with horizontal padding on mobile

**UX-2.1.4: Page Composition**

- **Page 1**: Checkout form (`/bayar`)
- **Page 2**: Success page with WhatsApp redirect

---

### 2.2 Loading States

**UX-2.2.1: Form Submission Loading**

- Checkout button shows loading spinner
- Button text changes to "Memproses..." or similar
- All form inputs disabled
- Order summary in read-only mode

**UX-2.2.2: Page Load**

- Show skeleton/loading state while fetching product data
- Load order summary products via batch read
- Page load time not critical (no specific requirement)

---

### 2.3 Interactive Elements

**UX-2.3.1: Quantity Controls**

- Increment button (+)
- Decrement button (-)
- Direct number input
- Disable decrement if quantity = 1
- Disable increment if quantity = stock
- Show current stock availability

**UX-2.3.2: Checkout Button**

- Prominent, clear CTA
- Label: "Lanjutkan Pembayaran" or "Checkout"
- Disabled state when loading
- Enabled only when form valid

**UX-2.3.3: WhatsApp Redirect Button (Success Page)**

- Prominent green button (WhatsApp brand color)
- Label: "Lanjutkan ke WhatsApp" or "Hubungi Kami"
- Clear icon (WhatsApp logo)

---

### 2.4 Responsive Behavior

**UX-2.4.1: Mobile Viewport**

- Touch-friendly controls (minimum 44×44px tap targets)
- Form inputs with appropriate mobile keyboards:
  - Phone: `type="tel"`
  - Email: `type="email"`
- Readable font sizes (minimum 16px to prevent zoom)

**UX-2.4.2: Desktop Viewport**

- Utilize horizontal space with two-column layout
- Form max-width for readability (~600px)

---

## 3. Technical Requirements

### 3.1 Technology Stack

**TECH-3.1.1: Framework**

- Primary: Astro components
- React islands: Only when necessary for interactivity
- Minimize client-side JavaScript

**TECH-3.1.2: State Management**

- Cart store: Existing `cart.store.ts` (nanostores)
- Checkout history store: New persistent store (nanostores + localStorage)

**TECH-3.1.3: Form Handling**

- React Hook Form or native form handling
- Schema validation with Zod

---

### 3.2 Data Management

**TECH-3.2.1: Product Data Fetching**

- Use batch read product action (similar to cart)
- Fetch on checkout page load
- Validate against cart items

**TECH-3.2.2: Space ID Source**

- Read from backend environment variable
- Access in Astro action: `import.meta.env.SPACE_ID`
- Do not expose to client

**TECH-3.2.3: Authentication**

- Use backend API key from environment
- Pass to batch transaction action

---

### 3.3 Performance

**TECH-3.3.1: Checkout Processing**

- Maximum timeout: 30 seconds
- Show timeout error if exceeded
- Implement request timeout in HTTP client

**TECH-3.3.2: Page Load**

- No specific requirement
- Acceptable to load product data on mount

---

### 3.4 Browser Support

**TECH-3.4.1: Compatibility**

- Modern browsers (last 2 versions)
- Mobile Safari
- Chrome/Edge (Chromium)
- Firefox

---

### 3.5 Accessibility

**TECH-3.5.1: Form Accessibility**

- Proper `<label>` for each input
- ARIA attributes for error messages
- Keyboard navigation support
- Focus management on validation errors

---

## 4. Data Requirements

### 4.1 Cart Data

**DATA-4.1.1: Cart Input**

- Cart items with `id` and `quantity`
- Source: `cart.store.ts`

**DATA-4.1.2: Cart Clearing**

- Clear cart on checkout success
- Call `clearCart()` function from cart store

---

### 4.2 Checkout History Store

**DATA-4.2.1: Store Schema**

```typescript
type CheckoutHistoryItem = {
  transactionId: number; // Transaction ID from backend
  timestamp: string; // ISO timestamp when checkout completed
};

type CheckoutHistory = CheckoutHistoryItem[];
```

**Purpose**: Store minimal data to enable batch read of latest transaction details

**Rationale**:

- Reduces storage size
- Always fetches latest transaction status from backend
- Prevents stale data in local storage
- Transaction details (customer info, items, status) fetched via batch read when viewing history

**DATA-4.2.2: Store Operations**

- `addCheckoutHistory(transactionId, timestamp)`: Add new checkout record
- `getCheckoutHistory()`: Retrieve all history (array of transaction IDs)
- `getLatestCheckout()`: Get most recent checkout transaction ID
- `clearCheckoutHistory()`: Clear all history
- Persist to localStorage

**DATA-4.2.3: Batch Read Integration**

- When viewing checkout history page:
  - Read transaction IDs from store
  - Use batch read operation to fetch full transaction details
  - Display latest status, customer info, and items from backend
- Benefits:
  - Always shows current transaction status
  - Reduces localStorage usage
  - No stale data

---

## 5. Validation Requirements

### 5.1 Form Validation

**VALID-5.1.1: Required Field Validation**

- Check all required fields are non-empty
- Trim whitespace before validation

**VALID-5.1.2: Phone Number Validation**

- Pattern: `^(\+62|62|08)\d+$`
- Must start with `+62`, `62`, or `08`
- Allow any number of digits after prefix

**VALID-5.1.3: Email Validation**

- Standard email regex or browser validation
- Must contain `@` and valid domain

---

### 5.2 Business Validation

**VALID-5.2.1: Cart Validation**

- Cart must not be empty
- All cart items must be valid products
- All quantities must be positive integers

**VALID-5.2.2: Stock Validation**

- Each item quantity ≤ available stock
- Product must be in stock (stock > 0)
- Validate before checkout submission

---

## 6. Non-Functional Requirements

### 6.1 Reliability

**NFR-6.1.1: Error Recovery**

- Preserve form data on error
- Allow retry without re-entering data
- Store checkout history even if WhatsApp redirect fails

**NFR-6.1.2: Data Persistence**

- Checkout history persists across sessions
- Cart state preserved until explicitly cleared

---

### 6.2 Usability

**NFR-6.2.1: Feedback**

- Clear loading indicators during processing
- Immediate feedback on actions (quantity change, form submission)
- Clear error messages with actionable guidance

**NFR-6.2.2: Mobile Experience**

- Touch-friendly controls
- Appropriate mobile keyboards
- Readable without zooming

---

### 6.3 Internationalization

**NFR-6.3.1: Language**

- Indonesian language for all UI text
- Currency format: Indonesian Rupiah (Rp)
- Date format: Indonesian format if displayed

---

## 7. Future Considerations

### 7.1 Potential Enhancements

- Payment gateway integration
- Multiple delivery address management
- Order tracking
- Guest checkout vs authenticated user checkout
- Saved addresses for returning customers
- Multiple payment methods
- Delivery time slot selection
- Gift message option
- Promo code/discount support

---

## 8. Out of Scope

The following are explicitly **NOT** required for initial implementation:

- Payment processing
- User authentication
- Order status tracking
- Admin order management
- Shipping fee calculation
- Tax calculation
- Multi-step checkout wizard
- Address autocomplete
- Real-time stock synchronization
- Order modification after submission
- Order cancellation
