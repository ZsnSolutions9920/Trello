import type { Board, BoardSummary, Card, List, Comment, MoveCardPayload, AttendanceRecord, InboxThread, ContactMessageWithReplies, MessageReplyData, TeamData } from "@/types";

const BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${url}`, {
    headers,
    ...options,
  });

  if (res.status === 401) {
    // Token expired or invalid — clear and redirect
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
}

// Auth endpoints (no token needed)
interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  teamId: string | null;
}

export const authApi = {
  register: (email: string, password: string, name?: string) =>
    fetcher<{ token: string; user: AuthUser }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ email, password, name }) },
    ),
  login: (email: string, password: string) =>
    fetcher<{ token: string; user: AuthUser }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    ),
};

export const api = {
  boards: {
    list: () => fetcher<BoardSummary[]>("/boards"),
    get: (id: string) => fetcher<Board>(`/boards/${id}`),
    create: (title: string) =>
      fetcher<BoardSummary>("/boards", {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    update: (id: string, title: string) =>
      fetcher<BoardSummary>(`/boards/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      }),
    delete: (id: string) =>
      fetcher<void>(`/boards/${id}`, { method: "DELETE" }),
  },

  lists: {
    create: (title: string, boardId: string) =>
      fetcher<List>("/lists", {
        method: "POST",
        body: JSON.stringify({ title, boardId }),
      }),
    update: (id: string, data: { title?: string; position?: number }) =>
      fetcher<List>(`/lists/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetcher<void>(`/lists/${id}`, { method: "DELETE" }),
  },

  cards: {
    create: (title: string, listId: string) =>
      fetcher<Card>("/cards", {
        method: "POST",
        body: JSON.stringify({ title, listId }),
      }),
    update: (id: string, data: { title?: string; description?: string | null }) =>
      fetcher<Card>(`/cards/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetcher<void>(`/cards/${id}`, { method: "DELETE" }),
    move: (id: string, payload: MoveCardPayload) =>
      fetcher<Card>(`/cards/${id}/move`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },

  comments: {
    list: (cardId: string) => fetcher<Comment[]>(`/cards/${cardId}/comments`),
    create: (cardId: string, content: string) =>
      fetcher<Comment>(`/cards/${cardId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
  },

  messages: {
    send: (boardId: string, data: { senderName: string; senderEmail?: string; content: string }) =>
      fetcher<void>(`/boards/${boardId}/messages`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  inbox: {
    list: () => fetcher<InboxThread[]>("/inbox"),
    boardMessages: (boardId: string) =>
      fetcher<ContactMessageWithReplies[]>(`/boards/${boardId}/messages`),
    reply: (boardId: string, messageId: string, content: string) =>
      fetcher<MessageReplyData>(`/boards/${boardId}/messages/${messageId}/reply`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
  },

  discord: {
    disconnect: () =>
      fetcher<void>("/auth/discord/disconnect", { method: "DELETE" }),
  },

  attendance: {
    status: () =>
      fetcher<{ status: "not_signed_in" | "signed_in" | "signed_out"; record: unknown }>(
        "/attendance",
      ),
    submit: (action: "sign-in" | "sign-out", photo: string) =>
      fetcher<unknown>("/attendance", {
        method: "POST",
        body: JSON.stringify({ action, photo }),
      }),
    history: () =>
      fetcher<AttendanceRecord[]>("/attendance/history"),
  },

  team: {
    get: () => fetcher<TeamData | null>("/team"),
    create: (name: string) =>
      fetcher<{ id: string; name: string; inviteCode: string }>("/team", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    join: (inviteCode: string) =>
      fetcher<{ id: string; name: string }>("/team/join", {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      }),
    regenerateInviteCode: () =>
      fetcher<{ inviteCode: string }>("/team/invite-code", { method: "POST" }),
    removeMember: (memberId: string) =>
      fetcher<void>(`/team/members/${memberId}`, { method: "DELETE" }),
  },
};
