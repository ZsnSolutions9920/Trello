export interface BoardSummary {
  id: string;
  title: string;
  createdAt: string;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  lists: List[];
  ownerDiscordConnected: boolean;
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  listId: string;
}

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  userId: string;
  createdAt: string;
}

export interface MoveCardPayload {
  targetListId: string;
  newPosition: number;
}

export interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export interface TeamData {
  id: string;
  name: string;
  inviteCode: string;
  adminId: string;
  members: TeamMember[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  signInAt: string;
  signOutAt: string | null;
  createdAt: string;
}

export interface MessageReplyData {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

export interface ContactMessageWithReplies {
  id: string;
  boardId: string;
  senderName: string;
  senderEmail: string | null;
  content: string;
  deliveryStatus: string;
  createdAt: string;
  replies: MessageReplyData[];
}

export interface InboxThread {
  boardId: string;
  boardTitle: string;
  messages: ContactMessageWithReplies[];
  lastMessageAt: string;
}

export interface ApiError {
  error: string;
}
