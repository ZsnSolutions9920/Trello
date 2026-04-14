# API Specification — Employee Management Platform

## Base URL
`/api`

All endpoints return JSON. Auth endpoints marked with [Auth] require `Authorization: Bearer <token>` header.

---

## Auth

### POST /auth/register
Create a new account.
```
Request:  { email, password, name? }
Response: { token, user: { id, email, name } }
```

### POST /auth/login
```
Request:  { email, password }
Response: { token, user: { id, email, name } }
```

### GET /auth/me [Auth]
Get current user profile.
```
Response: { id, email, name, discordConnected }
```

---

## Discord OAuth

### GET /auth/discord?token=<jwt> [Auth via query]
Redirects to Discord OAuth. Browser navigation (not fetch).

### GET /auth/discord/callback
OAuth callback. Exchanges code, stores discordId, redirects to app.

### DELETE /auth/discord/disconnect [Auth]
Removes Discord link from the user account.

---

## Boards

### GET /boards [Auth]
Get all boards assigned to the current user.
```
Response: BoardSummary[]
```

### POST /boards [Auth]
Create board (auto-creates 3 default lists: To-dos, In-progress, Completed).
```
Request:  { title }
Response: BoardSummary
```

### GET /boards/:id [Auth]
Get board with all lists, cards, and ownerDiscordConnected flag.
```
Response: Board (with nested lists → cards)
```

### PATCH /boards/:id [Auth]
```
Request:  { title }
Response: Board
```

### DELETE /boards/:id [Auth]
Cascade deletes all lists, cards, comments, messages.

---

## Lists

### POST /lists [Auth]
```
Request:  { title, boardId }
Response: List
```

### PATCH /lists/:id [Auth]
```
Request:  { title?, position? }
Response: List
```

### DELETE /lists/:id [Auth]

---

## Cards

### POST /cards [Auth]
```
Request:  { title, listId }
Response: Card
```

### PATCH /cards/:id [Auth]
```
Request:  { title?, description? }
Response: Card
```

### DELETE /cards/:id [Auth]

### PATCH /cards/:id/move [Auth]
```
Request:  { targetListId, newPosition }
Response: Card
```

---

## Comments

### GET /cards/:id/comments [Auth]
```
Response: Comment[]
```

### POST /cards/:id/comments [Auth]
```
Request:  { content }
Response: Comment
```

---

## Messages (Board Contact)

### POST /boards/:id/messages [No auth — public]
Send a message to the board owner via Discord DM.
Rate limited: 5 per 15 min per IP. Honeypot field.
```
Request:  { senderName, senderEmail?, content }
Response: { success: true } (202)
Error:    422 if owner has no Discord connected
```

### GET /boards/:id/messages [Auth — board owner only]
Get all messages for a board with replies.
```
Response: ContactMessageWithReplies[]
```

### POST /boards/:id/messages/:messageId/reply [Auth — board owner only]
Reply to a message. Reply sent as Discord DM to board owner.
```
Request:  { content }
Response: MessageReply
```

---

## Inbox

### GET /inbox [Auth]
Get all messages across all boards owned by the user, grouped by board.
```
Response: InboxThread[]
```

---

## Attendance

### GET /attendance [Auth]
Check today's attendance status.
```
Response: { status: "not_signed_in" | "signed_in" | "signed_out", record }
```

### POST /attendance [Auth]
Clock in or clock out. Requires photo.
```
Request:  { action: "sign-in" | "sign-out", photo: base64 }
Response: Attendance record
```

### GET /attendance/history [Auth]
Get all attendance records for the current user.
```
Response: AttendanceRecord[]
```

---

## Error Format

All errors return:
```json
{ "error": "Error message" }
```

HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 422 (unprocessable), 429 (rate limit), 500 (server error), 502 (Discord delivery failure).

---

## Notes

- ALWAYS validate input
- ALWAYS return consistent response shapes
- NEVER mix response formats
- Personal messages must go as Discord DMs, never to public channels
- Board access must be verified (owner or admin) before any operation
