Implement the backend for the Employee Management Platform.

Rules:
- Clean architecture: API routes → services → repositories
- Validate all inputs at the API boundary
- Centralized error handling via AppError
- Async/await throughout
- Access control: verify board ownership before operations

Key modules:
- Auth (JWT, register, login, Discord OAuth)
- Teams (create, invite codes, join)
- Boards (CRUD, assignment, default lists on create)
- Lists/Cards (CRUD, drag-and-drop positioning)
- Attendance (clock in/out, photo to Discord, log to Google Sheets)
- Messages (send via Discord DM, inbox, replies)

Build incrementally — core modules first, then features.
