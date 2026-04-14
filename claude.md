# CLAUDE.md — Employee Management Platform

## Project Overview

A production-grade **Employee Management Platform** where admins create teams, invite employees via invite codes, assign task boards, track attendance, and communicate through Discord integration.

### Core Features
- **Team Management** — Admin creates a team, generates invite codes, employees join via code
- **Task Boards** — Boards with lists (To-dos, In-progress, Completed) and cards, assigned per employee
- **Attendance** — Clock in/out with camera photo, logged to Discord channel + Google Sheets
- **Discord Messaging** — External users and admins message employees via Discord DM
- **Inbox** — Threaded message inbox with reply capability
- **Dashboard** — Per-employee attendance history, stats (total days, avg hours, weekly)
- **Real-time** — Live sync via Socket.io across all clients
- **Mobile App** — Expo React Native companion app

### Roles
- **Admin** — Creates team, invites employees, assigns boards/tasks, sees all team boards
- **Employee** — Sees only their assigned boards, marks attendance, receives messages

This is NOT a prototype. This must be scalable, maintainable, and clean.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS v4, Zustand |
| Backend | Next.js API routes, Prisma ORM v7, PostgreSQL |
| Realtime | Socket.io (custom server.ts) |
| Auth | JWT (bcryptjs + jsonwebtoken) |
| Discord | Bot API (DMs, attendance channel), OAuth (account linking) |
| Sheets | Google Sheets API (service account, attendance log) |
| Mobile | Expo (React Native), expo-router |

---

## Source of Truth

Claude MUST follow prompts from `/docs/prompts/`.

Claude should:
1. Read relevant prompt file BEFORE implementing anything
2. Never assume behavior not defined in prompts
3. Ask for clarification if missing

---

## Development Rules

### Code Quality
- Use TypeScript everywhere — strong typing, no `any`
- Modular architecture, no duplicated logic
- Clean naming conventions

### Architecture
- Separation of concerns: API routes → services → repositories
- No business logic inside UI components
- No direct DB calls from controllers

### Error Handling
- Centralized error handling via `AppError` class
- Always validate inputs at the API boundary
- Never crash the app

### State Management
- Normalize data in Zustand stores
- Avoid deep nesting
- Use selectors for derived state

---

## Critical Constraints

Claude MUST NOT:
- Skip architecture planning
- Write incomplete features
- Break existing functionality
- Send personal messages to public channels (attendance channel is separate from DMs)
- Allow employees to see other employees' boards

Claude MUST:
- Respect existing code patterns
- Keep boards visible only to their assigned employee + admin
- Ensure Discord DMs go only to the intended recipient
- Keep attendance data private per employee

---

## Development Workflow

For every feature:
1. Read relevant prompt from `/docs/prompts/`
2. Plan implementation
3. Define types/interfaces
4. Implement backend (repository → service → API route)
5. Implement frontend UI
6. Connect API
7. Handle edge cases

---

## Database Models

| Model | Purpose |
|-------|---------|
| User | id, email, password, name, discordId, discordConnectedAt |
| Board | id, title, ownerId (assigned employee) |
| List | id, title, position, boardId |
| Card | id, title, description, position, listId |
| Comment | id, content, cardId, userId |
| Label / CardLabel | Tagging system |
| Activity | Audit log (type, metadata, userId, boardId) |
| Attendance | userId, date, signInAt, signOutAt (unique per user+date) |
| ContactMessage | boardId, senderName, content, deliveryStatus |
| MessageReply | contactMessageId, userId, content |

---

## Environment Variables

```
DATABASE_URL                  — PostgreSQL connection string
JWT_SECRET                    — JWT signing secret
NEXT_PUBLIC_APP_URL           — App URL
DISCORD_BOT_TOKEN             — Discord bot token
DISCORD_CLIENT_ID             — Discord OAuth client ID
DISCORD_CLIENT_SECRET         — Discord OAuth client secret
DISCORD_REDIRECT_URI          — Discord OAuth callback URL
DISCORD_ATTENDANCE_CHANNEL_ID — Channel for attendance notifications only
GOOGLE_SERVICE_ACCOUNT_KEY    — Google Sheets service account JSON (single line)
GOOGLE_SHEET_ID               — Spreadsheet ID for attendance
```

---

## Notes

If unsure — STOP and ASK for clarification. Do NOT guess.
