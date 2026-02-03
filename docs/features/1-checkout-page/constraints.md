# Checkout Page - Constraints

## 1. Architectural Constraints

### C-1.1: Hybrid Rendering Model

- The checkout page **MUST NOT** be a full Single Page Application (SPA).
- It **MUST** be implemented as an Astro page (`.astro`) with server-side rendering.
- React components **MAY** be used for interactive sections (Islands architecture), but the page shell, meta tags, and static layout **MUST** be rendered by Astro.

### C-1.2: Client-Server Isolation

- Sensitive configuration values, specifically `space_id` and backend API keys, **MUST** remain strictly on the server side.
- These values **MUST NOT** be exposed to the client via `public` environment variables, props, or global objects.
- All interactions requiring these keys **MUST** go through Astro Actions or API endpoints.

## 2. Business Scope Constraints

### C-2.1: No External Payment Processing

- The system **MUST NOT** integrate with any external payment gateways (e.g., Midtrans, Xendit, Stripe).
- The "Payment" step is strictly defined as an off-platform manual process negotiated via WhatsApp.

### C-2.2: Guest-Only Access

- The system **MUST NOT** implement or require user authentication (Login/Register).
- There is no "User Account" concept for this feature; all checkouts are treated as anonymous/guest transactions.

### C-2.3: WhatsApp Termination

- The checkout flow **MUST** terminate with a redirect to WhatsApp.
- The system **CANNOT** consider a checkout flow complete without offering this redirection point.

## 3. Technical & Protocol Constraints

### C-3.1: Immutable Batch Protocol

- The transaction creation **MUST** adhere to the strict backend batch sequence:
  1. `create` (Draft Transaction)
  2. `update` (Customer Information)
  3. `createDetail` (Line Items)
- This order is **IMMUTABLE** and enforced by the backend service. The frontend **CANNOT** deviate from this sequence (e.g., cannot try to create details before the main transaction).

### C-3.2: Atomic Consistency

- The batch operation **MUST** be atomic.
- If any operation within the batch fails (e.g., one detail fails to create), the entire batch request **MUST** fail.
- Partial success states are **FORBIDDEN**; the system must not leave "orphan" transactions without details.

### C-3.3: Data Structure Rigidity

- Customer information **MUST** be stored in the `receiver_notes` field as a single string.
- The system **CANNOT** add new columns or fields to the `transactions` table to store customer data separately.
