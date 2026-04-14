Design the frontend system using Next.js App Router.

Pages:
- Auth (login, register)
- Home (boards grid, attendance banner, clock in/out)
- Board view (lists, cards, drag-and-drop, message sidebar)
- Inbox (threaded conversations grouped by board)
- Dashboard (attendance history, stats)
- Settings (Discord connect/disconnect, profile)

Requirements:
- Fully componentized, reusable UI
- Zustand stores for auth, board, and UI state
- API abstraction layer (src/lib/api.ts)
- Optimistic UI updates with rollback
- Role-based visibility (admin sees all, employee sees own)

Include:
- Folder structure
- Component hierarchy
- Store design

Do NOT implement yet.
