Implement authentication and authorization:

### Auth
- Signup/login with email + password
- JWT tokens (7-day expiry)
- Password hashing with bcryptjs (12 rounds)
- Protected API routes via getAuthUserId() middleware
- Session persistence via localStorage (web) / SecureStore (mobile)

### Authorization (future: team system)
- Admin role: can create teams, invite employees, assign boards, see everything
- Employee role: can only see assigned boards, mark attendance, receive messages
- Board access: verify ownerId matches authenticated user (or user is admin)

### Discord OAuth
- Connect flow: /api/auth/discord → Discord authorize → callback stores discordId
- State JWT for CSRF prevention
- Disconnect endpoint to unlink

Security:
- Never expose password hashes
- Never expose discordId to other users
- Rate limiting on auth endpoints
