# Order Lookup - Constraints

## Feature Overview

This document defines the non-negotiable constraints for the order lookup feature. Constraints are hard limitations that cannot be violated without changing the fundamental nature of the feature or breaking existing functionality.

---

## Document Authority

This document is constrained by [use-cases.md](./use-cases.md) and [requirements.md](./requirements.md). All constraints must align with the intent expressed in those documents.

**Document Hierarchy:**

1. use-cases.md (intent) - Highest authority
2. requirements.md (obligations)
3. **constraints.md (non-negotiables)** - This document
4. api-contract.md (external behavior)
5. technical-notes.md (exploratory realization)

---

## Technical Constraints

### TC-1: API Response Structure Immutability

**Constraint**: The current discriminated union response structure must not be modified.

**Details**:

- Success response: `{id: number, success: true}`
- Failure response: `{success: false}`
- Structure is defined by `orderLookupResponseSchema` using Zod discriminated union
- Additional fields may be added in future versions, but the current structure is the baseline

**Rationale**: Maintains backward compatibility and predictable API behavior.

**Traceability**: AIR-1 (Lookup Endpoint)

---

### TC-2: HTTP Method Constraints

**Constraint**: HTTP methods for endpoints are fixed and cannot be changed.

**Details**:
| Endpoint | Method | Constraint |
|----------|--------|------------|
| `trades/lookup` | POST | Must use POST |
| `trades/{id}` | GET | Must use GET |

**Rationale**: API contract is established and changing methods would break integration.

**Traceability**: AIR-1, AIR-2

---

### TC-3: No Data Type Constraints on Order ID

**Constraint**: The order ID returned in successful lookup responses has no additional constraints beyond being a number.

**Details**:

- Type: `number`
- No range limitations
- No format requirements
- No maximum value constraints

**Rationale**: Backend manages ID generation; frontend accepts any valid number.

**Traceability**: DR-1 (Order Response Schema)

---

### TC-4: No Backend Validation Constraints Beyond Schema

**Constraint**: The Zod schema validation represents the complete validation constraints.

**Details**:

- `number`: any string (no max length, no character encoding restrictions)
- `phone`: any string (no max length, no character encoding restrictions)
- Backend may have additional validation, but it is not a documented constraint

**Rationale**: Schema is the contract; backend validation is implementation detail.

**Traceability**: VR-1, VR-2, VR-3

---

## Security Constraints

### SC-1: BACKEND_API_KEY Authentication Required

**Constraint**: All API calls to fetch order details must use BACKEND_API_KEY authentication.

**Details**:

- Token source: Environment variables (`BACKEND_API_KEY`)
- Token placement: Request context (not exposed to client)
- No alternative authentication methods allowed
- Hard constraint - cannot be changed without system-wide impact

**Rationale**: Ensures secure access to order data; authentication method is system-wide standard.

**Traceability**: AIR-3 (Authentication)

---

### SC-2: Data Exposure Prohibition

**Constraint**: Specific data fields must never be exposed through order lookup.

**Prohibited Fields**:

- Customer personal information (name, email, full phone number)
- Shipping address details
- Payment information
- Internal notes (sender_notes, receiver_notes, handler_notes)
- Transaction fees
- Attached files
- External links
- Handler/sender/receiver IDs and details
- Financial details (debit, credit, discount, weight)

**Details**:

- This is a hard constraint
- No exceptions allowed
- Applies to all transaction statuses

**Rationale**: Protects customer privacy and prevents information leakage.

**Traceability**: DR-4 (Data Exclusion), Security & Privacy section

---

### SC-3: Generic Error Messages Only

**Constraint**: Only generic error messages may be displayed; no error codes or field-specific errors allowed.

**Details**:

- Required message (Indonesian): "Nomor transaksi atau nomor telepon tidak cocok. Silakan periksa kembali data yang Anda masukkan."
- Translation: "Transaction number or phone number does not match. Please check the data you entered."
- No error codes for debugging (prevents brute force enumeration)
- No indication of which field was incorrect
- No distinction between "transaction not found" and "phone mismatch"

**Rationale**: Prevents information leakage that could be exploited for order enumeration attacks.

**Traceability**: SR-1 (Generic Error Messages), Error Handling section

---

### SC-4: No Session Persistence

**Constraint**: The system must not create or persist any session after lookup.

**Details**:

- No cookies may be set
- No localStorage usage for authentication
- No sessionStorage usage for authentication
- Each lookup requires full re-authentication
- No automatic login or account linking

**Rationale**: Maintains guest-only nature of feature; prevents unauthorized access through session hijacking.

**Traceability**: SR-2 (No Session Persistence), Session Management section

---

### SC-5: Session Persistence Edge Cases - Known Risk

**Constraint**: Browser-level features may inadvertently persist form data.

**Details**:

- Browser autofill may remember transaction numbers
- Password managers may offer to save form data
- Browser history may contain transaction numbers in URL (if query params used)
- These are known risks outside system control

**Mitigation**:

- Use autocomplete="off" on sensitive fields
- Do not include credentials in URL parameters
- Document this as accepted risk

**Rationale**: System cannot control all browser behaviors; must acknowledge and mitigate where possible.

**Traceability**: SR-2 (No Session Persistence)

---

## Business Constraints

### BC-1: All Transaction Statuses Must Be Supported

**Constraint**: Order lookup must work for all transaction statuses without exception.

**Required Supported Statuses**:
| Status | Code |
|--------|------|
| Draft | TX_DRAFT |
| Request | TX_REQUEST |
| Ready | TX_READY |
| Sent | TX_SENT |
| Received | TX_RECEIVED |
| Completed | TX_COMPLETED |
| Cancelled | TX_CANCELED |
| Return | TX_RETURN |
| Closed | TX_CLOSED |

**Details**:

- No status may be excluded
- All statuses must be treated equally in lookup validation
- Status display may vary, but lookup must succeed for all

**Rationale**: Users may need to check orders in any state; feature must be universally accessible.

**Traceability**: FR-5 (Support for All Transaction Statuses)

---

### BC-2: Test Transaction Detection

**Constraint**: Test transactions must be identified and excluded from lookup results.

**Detection Method**:

- Test transactions lack timestamp data
- All legitimate transactions have at least `createdAt` timestamp
- If timestamps object is null/undefined, treat as test transaction

**Behavior**:

- Return generic error message
- Do not reveal that transaction is a test

**Rationale**: Test data should not be visible to users; detection method is based on data schema.

**Traceability**: ECR-2 (Test Transactions)

---

### BC-3: Phone Matching Constraint

**Constraint**: Phone number verification is strictly limited to last 4 digits.

**Details**:

- Only last 4 digits of phone number are used for verification
- No other phone number matching methods allowed
- Backend performs the matching (not frontend)
- Cannot be configured to use different digit counts

**Rationale**: Provides lightweight authentication while maintaining security; consistent user experience.

**Traceability**: UC-1 (Check Order Status), VR-3 (Backend Validation)

---

### BC-4: Empty Order Handling

**Constraint**: Orders with no products must display an empty state, not redirect.

**Details**:

- Display inline empty state message
- Do not redirect to error page
- Do not treat as error condition
- Show order metadata (number, status) even if no products

**Rationale**: Users should see confirmation that order exists even if product list is empty.

**Traceability**: FR-4 (Order Data Display), AC-3 (Empty Order)

---

## Data Constraints

### DC-1: Deleted/Archived Order Instant Unavailability

**Constraint**: Deleted or archived orders must immediately fail lookup.

**Details**:

- No eventual consistency delay allowed
- Must fail instantly upon deletion
- Return generic error message
- Do not reveal that order was deleted (vs. never existed)

**Rationale**: Ensures data privacy; deleted orders should be immediately inaccessible.

**Traceability**: ECR-1 (Deleted or Archived Orders)

---

### DC-2: No Additional Excluded Fields

**Constraint**: As of current implementation, no additional fields beyond those listed in SC-2 are prohibited.

**Details**:

- Current excluded field list is complete
- Future fields may be added to exclusion list
- All currently visible fields are approved for display

**Rationale**: Documents that current data exposure boundaries are complete.

**Traceability**: DR-4 (Data Exclusion)

---

## Integration Constraints

### IC-1: 30-Second Timeout Hard Constraint

**Constraint**: API requests must timeout after exactly 30 seconds.

**Details**:

- Maximum wait time: 30 seconds
- Cannot be adjusted or configured
- Applies to both lookup and fetch endpoints
- On timeout: treat as network error

**Rationale**: Prevents indefinite waiting; consistent user experience across all requests.

**Traceability**: EHR-3 (Timeout Handling), PR-1 (Response Time)

---

### IC-2: Rate Limiting May Be Introduced Later

**Constraint**: Rate limiting is not currently required but may be added in future versions.

**Details**:

- Currently: No rate limiting
- Future: May implement if abuse detected
- Must be implementable without breaking changes
- No constraints on rate limiting design (to be determined if needed)

**Rationale**: Allows future security enhancements without constraining current implementation.

**Traceability**: SR-3 (No Rate Limiting), FC-1 (Rate Limiting)

---

### IC-3: Caching Constraints Undefined

**Constraint**: Client-side caching constraints are currently undefined.

**Details**:

- Caching is optional
- No constraints on cache duration
- No constraints on invalidation triggers
- No constraints on cache key format
- If implemented: Use average/standard caching patterns

**Rationale**: Caching is not a current requirement; constraints will be defined if/when feature is implemented.

**Traceability**: PR-2 (Client-Side Caching)

---

### IC-4: No Concurrent Request Limits

**Constraint**: No maximum limit on concurrent lookup requests per IP.

**Details**:

- Multiple simultaneous lookups allowed
- No throttling based on IP address
- No queueing mechanism required
- System must handle concurrent load

**Rationale**: Feature must support high-traffic scenarios without artificial restrictions.

**Traceability**: PR-3 (No Concurrent Request Restrictions)

---

## UI/UX Constraints

### UC-1: WCAG 2.1 Level AA Compliance Required

**Constraint**: The feature must meet WCAG 2.1 Level AA accessibility standards.

**Details**:

- Minimum compliance level: WCAG 2.1 Level AA
- No specific component constraints beyond standard
- Must support keyboard navigation
- Must support screen readers
- Must have sufficient color contrast

**Rationale**: Legal and ethical requirement for accessibility; no exceptions allowed.

**Traceability**: UR-4 (Accessibility), AC-5 (Accessibility)

---

### UC-2: Sonner Toast with shadcn Defaults

**Constraint**: Error messages must use Sonner toast with default shadcn/ui settings.

**Details**:

- Component: Sonner notification library
- Configuration: Use shadcn/ui defaults
- No custom duration constraints
- No custom position constraints
- No custom styling constraints

**Rationale**: Consistent with design system; defaults are acceptable.

**Traceability**: EHR-1 (Validation Error Display)

---

### UC-3: Mobile-Friendly Design

**Constraint**: The form must be mobile-friendly without specific viewport constraints.

**Details**:

- Must fit within mobile viewport widths
- Touch-friendly input sizes (no specific size constraints)
- Responsive layout required
- No specific breakpoint constraints
- No specific touch target size constraints

**Rationale**: Must work on all devices; exact implementation flexible within "mobile-friendly" guideline.

**Traceability**: UR-3 (Mobile Responsiveness), AC-4 (Mobile Experience)

---

## Traceability Matrix

| Constraint | Requirement      | Type      | Priority |
| ---------- | ---------------- | --------- | -------- |
| TC-1       | AIR-1            | Hard      | High     |
| TC-2       | AIR-1, AIR-2     | Hard      | High     |
| TC-3       | DR-1             | Hard      | Medium   |
| TC-4       | VR-1, VR-2, VR-3 | Hard      | Medium   |
| SC-1       | AIR-3            | Hard      | Critical |
| SC-2       | DR-4, Security   | Hard      | Critical |
| SC-3       | SR-1             | Hard      | Critical |
| SC-4       | SR-2             | Hard      | Critical |
| SC-5       | SR-2             | Risk      | Medium   |
| BC-1       | FR-5             | Hard      | High     |
| BC-2       | ECR-2            | Hard      | High     |
| BC-3       | UC-1, VR-3       | Hard      | High     |
| BC-4       | FR-4, AC-3       | Hard      | Medium   |
| DC-1       | ECR-1            | Hard      | High     |
| DC-2       | DR-4             | Hard      | Medium   |
| IC-1       | EHR-3, PR-1      | Hard      | High     |
| IC-2       | SR-3, FC-1       | Flexible  | Low      |
| IC-3       | PR-2             | Undefined | Low      |
| IC-4       | PR-3             | Hard      | Medium   |
| UC-1       | UR-4, AC-5       | Hard      | Critical |
| UC-2       | EHR-1            | Hard      | Medium   |
| UC-3       | UR-3, AC-4       | Hard      | High     |

**Legend**:

- **Hard**: Non-negotiable constraint
- **Flexible**: May change in future versions
- **Risk**: Known issue with mitigation
- **Undefined**: Not yet determined
- **Critical**: Must be satisfied for feature to function
- **High**: Important for feature quality
- **Medium**: Standard requirement
- **Low**: Optional or future consideration

---

## Constraint Categories Summary

### Hard Constraints (Non-Negotiable)

These constraints cannot be violated without breaking the feature:

1. **TC-1**: API response structure immutability
2. **TC-2**: HTTP method constraints
3. **SC-1**: BACKEND_API_KEY authentication
4. **SC-2**: Data exposure prohibition
5. **SC-3**: Generic error messages only
6. **SC-4**: No session persistence
7. **BC-1**: All transaction statuses supported
8. **BC-3**: Last 4 digits phone matching
9. **DC-1**: Deleted orders instantly unavailable
10. **IC-1**: 30-second timeout
11. **IC-4**: No concurrent request limits
12. **UC-1**: WCAG 2.1 Level AA compliance

### Flexible Constraints (May Change)

These constraints may be modified in future versions:

1. **IC-2**: Rate limiting (may be introduced later)

### Undefined Constraints (To Be Determined)

These areas have no current constraints:

1. **IC-3**: Caching constraints

### Known Risks

These are acknowledged issues with mitigations:

1. **SC-5**: Session persistence edge cases (browser autofill, password managers)

---

_Document Authority: This document defines non-negotiable constraints derived from requirements.md. All implementation must respect these constraints._
