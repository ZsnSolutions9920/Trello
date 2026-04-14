Optimize the Employee Management Platform for performance:

### Frontend
- Avoid unnecessary re-renders (React.memo, useMemo, useCallback)
- Optimistic UI updates (instant feedback, sync in background)
- Lazy load heavy components (modals, camera)
- Efficient list rendering (virtualize if >100 cards)

### Backend
- Indexed DB queries (boardId, listId, userId, date)
- Prisma connection pooling via PrismaPg adapter
- Non-blocking external calls (Discord DMs, Google Sheets are fire-and-forget)
- Rate limiting to prevent abuse

### Real-time
- Socket.io rooms scoped per board (no broadcast storms)
- Debounce rapid drag-and-drop commits
- Reconnect with full refetch (not incremental — simpler, more reliable)

### Mobile
- Snap scrolling for horizontal list navigation
- Gesture-based card movement (swipe, not drag)
- Minimal re-renders during scroll
