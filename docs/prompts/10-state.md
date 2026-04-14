Design Zustand stores for the Employee Management Platform:

### Auth Store
- token, user, isAuthenticated, ready
- setAuth, logout, loadFromStorage

### Board Store
- board (with lists + cards), loading, error
- fetchBoard, addList, deleteList
- addCard, updateCard, deleteCard
- moveCard (optimistic), reorderCardInList, commitMoveCard

### Future: Team Store
- team, members, inviteCode
- fetchTeam, generateInviteCode

Requirements:
- Normalize data (avoid deep nesting)
- Optimistic updates with rollback on failure
- Selectors for derived state
- localStorage persistence for auth (web), SecureStore for mobile
