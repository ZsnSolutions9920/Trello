# System Design — Employee Management Platform

## Overview

An employee management system where admins create teams, assign task boards to employees, track attendance with photo verification, and communicate via Discord.

### Core Capabilities
- Team creation with invite codes
- Task boards assigned per employee (lists + cards)
- Drag-and-drop task management
- Clock in/out attendance with camera capture
- Discord DM messaging to employees
- Threaded inbox with replies
- Attendance dashboard with stats
- Real-time collaboration via Socket.io
- Mobile companion app (Expo)

---

## High-Level Architecture

```
Client (Next.js Web / Expo Mobile)
         ↓
API Layer (Next.js API routes)
         ↓
Service Layer (business logic, access control)
         ↓
Repository Layer (Prisma ORM queries)
         ↓
PostgreSQL Database
```

External Integrations:
- Discord Bot API → DMs to employees, attendance channel notifications
- Google Sheets API → Attendance log (Date, Name, Clock In, Clock Out, Total Hours)

Realtime:
- Socket.io server attached to custom Node HTTP server
- Board-scoped rooms for live sync

---

## Data Flow

### Task Management
1. Admin assigns a board to an employee
2. Employee opens board → sees lists and cards
3. Employee drags card between lists → optimistic UI update
4. API persists the move → Socket.io broadcasts to other clients

### Attendance
1. Employee clicks Clock In on home page
2. Camera opens → employee takes photo
3. API saves attendance record + sends photo to Discord channel + appends to Google Sheet
4. Clock Out flow is identical, also calculates total hours

### Messaging
1. External user clicks "Message" on an employee's board
2. Message saved to DB → sent as Discord DM to the employee
3. Employee sees message in their inbox → can reply (reply also sent as Discord DM)

---

## Core Modules

### Frontend
- Auth pages (login, register)
- Home page (boards grid, attendance banner)
- Board view (lists, cards, drag-and-drop)
- Inbox (threaded conversations)
- Dashboard (attendance history + stats)
- Settings (Discord connection)
- Message sidebar (board-level chat)

### Backend
- Auth module (JWT, register, login)
- Team module (create, invite codes, join)
- Board module (CRUD, assignment, access control)
- List module (CRUD, positioning)
- Card module (CRUD, move, positioning)
- Attendance module (clock in/out, history)
- Message module (send, inbox, reply)
- Discord module (OAuth, DMs, channel messages)
- Google Sheets module (append, update rows)

---

## Access Control

| Action | Admin | Employee |
|--------|-------|----------|
| Create team | Yes | No |
| Generate invite codes | Yes | No |
| Create boards | Yes | No |
| Assign boards to employees | Yes | No |
| View all team boards | Yes | No |
| View own assigned boards | Yes | Yes |
| Manage cards/lists on boards | Yes | Yes (own boards only) |
| Mark attendance | Yes | Yes |
| View own attendance | Yes | Yes |
| Send/receive messages | Yes | Yes |
| Connect Discord | Yes | Yes |

---

## Realtime System

- Socket.io with board-scoped rooms
- Events: CARD_CREATED, CARD_MOVED, CARD_UPDATED, CARD_DELETED, LIST_CREATED, LIST_UPDATED, LIST_DELETED, BOARD_UPDATED
- Clients join room on board page load, leave on navigate away
- Reconnect logic with auto-refetch

---

## Scalability

- Stateless API (JWT auth, no server sessions)
- Socket.io rooms keep broadcasts scoped
- Indexed DB queries on boardId, listId, userId, date
- Prisma connection pooling via PrismaPg adapter

---

## Security

- JWT authentication with 7-day expiry
- Password hashing with bcryptjs (12 salt rounds)
- Discord OAuth state validation (CSRF prevention)
- Rate limiting on message endpoints (IP-based, 5 per 15 min)
- Honeypot fields on public-facing forms
- Personal messages go as DMs only — never to public channels
- Employees can only access their own boards and attendance

---

## Notes for Claude

- NEVER bypass the service layer
- NEVER let employees see other employees' boards
- NEVER send personal messages to the attendance channel
- ALWAYS validate board ownership before any board operation
- ALWAYS keep frontend and backend decoupled
