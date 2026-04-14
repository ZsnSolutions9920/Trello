Handle all edge cases for the Employee Management Platform:

### Task Management
- Deleting lists with cards (cascade)
- Moving cards rapidly (debounce commits)
- Network failures during drag (rollback to refetch)
- Duplicate socket events (idempotent updates)

### Attendance
- Already signed in today → 409 error
- Sign out without sign in → 400 error
- Camera permission denied → clear error message
- Discord/Sheets down → attendance still saves to DB (non-blocking external calls)

### Messaging
- Board owner has no Discord → hide Message button, API returns 422
- Discord DM delivery fails → save as "failed" status, show error to sender
- Rate limiting exceeded → 429 with retry-after header
- Bot spam → honeypot field on public message form

### Auth
- Expired JWT → 401, auto-redirect to login, clear storage
- Discord OAuth state mismatch → redirect to settings with error
- Same Discord account linked by two users → unique constraint prevents it

### Access Control (future)
- Employee tries to access another employee's board → 403
- Invalid invite code → clear error message
- Team admin deleted → handle orphaned team
