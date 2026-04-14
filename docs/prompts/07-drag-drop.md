Implement drag-and-drop for the task board:

- Cards within lists (reorder)
- Cards across lists (move between To-dos → In-progress → Completed)

Requirements:
- Smooth animations, no flicker
- Optimistic updates with backend sync
- Rollback on API failure (refetch board)
- Use dnd-kit library

Handle edge cases:
- Empty lists (drop target still works)
- Fast dragging
- Position calculation (midpoint between neighbors)

Mobile:
- Swipe gestures instead of drag-and-drop
- Swipe left = move to previous list
- Swipe right = move to next list
