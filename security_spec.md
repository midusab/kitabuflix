# Security Specification & Test Payloads for Midusa eLibrary

## 1. Data Invariants
- Users may only read and write their own profile document `/users/{userId}` where `request.auth.uid == userId`.
- Wishlist items under `/users/{userId}/wishlist/{bookId}` can only be read, created, updated, or deleted by the authenticated user whose UID matches `{userId}`, and incoming `userId` must match `request.auth.uid`.
- Cart items under `/users/{userId}/cart/{bookId}` can only be read, created, updated, or deleted by the authenticated owner `{userId}`.
- Orders under `/users/{userId}/orders/{orderId}` can only be created by the authenticated owner `{userId}` with verified fields, and cannot be tampered with or overwritten by unauthorized users.
- Book reviews under `/books/{bookId}/reviews/{reviewId}` are publicly readable by any user or visitor, but only authenticated users with verified identity can create their own review (`userId == request.auth.uid`), and users may only edit or delete their own review.
- Document IDs must satisfy `isValidId(id)` regex checks (`^[a-zA-Z0-9_-]+$`) and size constraints (<= 128 chars).
- No blanket read permissions or client-delegated security queries.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Ghost Admin Profile Escalation**: Payload to `/users/{attackerUid}` with `{ isAdmin: true, role: 'superadmin' }` -> Expected: PERMISSION_DENIED.
2. **Impersonated Wishlist Add**: Attacker creates `/users/{victimUid}/wishlist/book-1` with attacker's token -> Expected: PERMISSION_DENIED.
3. **Cart Item Price Tampering**: User attempts to update cart item with `priceKes: -500` or ghost field `freeOverride: true` -> Expected: PERMISSION_DENIED.
4. **Order State Manipulation**: Attacker updates `/users/{victimUid}/orders/order-99` marking `paymentStatus: 'refunded'` -> Expected: PERMISSION_DENIED.
5. **Review Author Spoofing**: User `attacker` submits review to `/books/clean-code/reviews/rev-1` with `userId: 'victim'` -> Expected: PERMISSION_DENIED.
6. **Review Rating Out-of-Bounds**: User submits review with `rating: 99` or `rating: -2` -> Expected: PERMISSION_DENIED.
7. **Giant String Denial of Wallet**: Document ID containing 5,000 characters or payload with 10MB malicious string -> Expected: PERMISSION_DENIED.
8. **Unauthenticated Order Write**: Anonymous or unauthenticated HTTP write to `/users/abc/orders/ord-1` -> Expected: PERMISSION_DENIED.
9. **Cart Read Cross-Tenant Snooping**: User A lists documents in `/users/{userB}/cart` -> Expected: PERMISSION_DENIED.
10. **Review Tamper by Third Party**: User B attempts `update` on User A's review at `/books/book-1/reviews/rev-a` -> Expected: PERMISSION_DENIED.
11. **Malicious Path Traversal**: Requesting path with `../` or special control chars in ID -> Expected: PERMISSION_DENIED.
12. **Blanket Collection Write**: Writing directly to the root `/{document=**}` -> Expected: PERMISSION_DENIED.
