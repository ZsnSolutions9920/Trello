Add real-time updates using Socket.io.

Features:
- Card/list/board changes sync instantly across clients
- Board-scoped rooms (clients join room for current board)
- All CRUD operations emit socket events after DB persistence

Events:
- list:created, list:updated, list:deleted
- card:created, card:updated, card:deleted, card:moved
- board:updated

Requirements:
- Custom server.ts attaching Socket.io to Next.js HTTP server
- Reconnect logic (auto-refetch on reconnect)
- Minimal payloads
- Non-blocking (socket emit should not block API response)
