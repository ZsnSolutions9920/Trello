# Database Design — Employee Management Platform

## Entities

### User
- id (cuid)
- email (unique)
- password (bcrypt hashed)
- name (optional)
- discordId (unique, optional — linked via OAuth)
- discordConnectedAt (optional)
- createdAt, updatedAt

### Board (Task workspace assigned to an employee)
- id (cuid)
- title
- ownerId → User (the assigned employee)
- createdAt, updatedAt

### List (Column within a board)
- id (cuid)
- title
- position (float — for drag-and-drop ordering)
- boardId → Board
- createdAt, updatedAt

### Card (Task within a list)
- id (cuid)
- title
- description (optional)
- position (float)
- listId → List
- createdAt, updatedAt

### Comment
- id (cuid)
- content
- cardId → Card
- userId → User
- createdAt, updatedAt

### Label / CardLabel
- Label: id, name, color
- CardLabel: cardId + labelId (composite key, many-to-many)

### Activity (Audit log)
- id (cuid)
- type (string)
- metadata (JSON)
- userId → User
- boardId → Board
- createdAt

### Attendance
- id (cuid)
- userId → User
- date (string YYYY-MM-DD)
- signInAt (DateTime)
- signOutAt (DateTime, optional)
- Unique constraint: userId + date (one sign-in per day)

### ContactMessage (Messages sent to employees)
- id (cuid)
- boardId → Board
- senderName
- senderEmail (optional)
- content
- senderIp (optional)
- deliveryStatus (pending / sent / failed)
- deliveryError (optional)
- createdAt

### MessageReply (Replies to messages)
- id (cuid)
- contactMessageId → ContactMessage
- userId → User (the replier)
- content
- createdAt

---

## Relationships

```
User → Boards (1:N via ownerId — boards assigned to employee)
Board → Lists (1:N)
List → Cards (1:N)
Card → Comments (1:N)
Card → CardLabels (M:N via CardLabel)
User → Comments (1:N)
User → Activities (1:N)
User → Attendances (1:N)
Board → ContactMessages (1:N)
ContactMessage → MessageReplies (1:N)
User → MessageReplies (1:N)
Board → Activities (1:N)
```

---

## Ordering System

Lists and Cards use `position` (float):
- New items: previous max + 65536
- Reorder between two items: (before + after) / 2
- Enables smooth drag-and-drop without rewriting all positions

---

## Indexing Strategy

- `boardId` on Lists, Activities, ContactMessages
- `listId` on Cards
- `cardId` on Comments
- `userId` on Activities, Attendances
- `date` on Attendances
- `contactMessageId` on MessageReplies
- Unique: `email` on User, `discordId` on User, `userId+date` on Attendance

---

## Cascade Rules

All child records cascade delete with their parent:
- Delete Board → deletes Lists, Cards, Comments, Activities, ContactMessages, MessageReplies
- Delete List → deletes Cards, Comments
- Delete Card → deletes Comments, CardLabels
- Delete ContactMessage → deletes MessageReplies
- Delete User → deletes Boards, Comments, Activities, Attendances, MessageReplies

---

## Notes

- NEVER load full nested trees unnecessarily
- Use pagination for large card lists
- Keep queries efficient — use indexes
- Attendance date is stored as string (YYYY-MM-DD) for timezone-agnostic daily uniqueness
