Design a production-ready PostgreSQL schema for the Employee Management Platform.

Entities must include:
- Users (with role: admin/employee, team membership, Discord link)
- Teams (with invite codes)
- Boards (assigned to employees)
- Lists (columns within boards)
- Cards (tasks within lists)
- Comments
- Labels
- Activities (audit log)
- Attendance (clock in/out per day)
- ContactMessages (messages to employees)
- MessageReplies (threaded replies)

Requirements:
- Proper normalization
- Foreign keys with cascade rules
- Indexing strategy for performance
- Unique constraints (email, discordId, userId+date attendance)
- Access control: employees see only their assigned boards

Provide:
- Prisma schema
- Relationship diagram
- Explain cascade behavior
