import { create } from "zustand";
import type { Board, List, Card } from "@/types";
import { api } from "@/lib/api";

interface BoardState {
  board: Board | null;
  loading: boolean;
  error: string | null;

  fetchBoard: (id: string) => Promise<void>;
  addList: (title: string) => Promise<void>;
  updateList: (id: string, title: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addCard: (title: string, listId: string) => Promise<void>;
  updateCard: (id: string, data: { title?: string; description?: string | null }) => Promise<void>;
  deleteCard: (id: string, listId: string) => Promise<void>;
  moveCard: (cardId: string, sourceListId: string, targetListId: string, newPosition: number) => void;
  reorderCardInList: (listId: string, activeCardId: string, overCardId: string) => void;
  commitMoveCard: (cardId: string, targetListId: string, newPosition: number) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  loading: false,
  error: null,

  fetchBoard: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const board = await api.boards.get(id);
      set({ board, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addList: async (title: string) => {
    const { board } = get();
    if (!board) return;
    try {
      const list = await api.lists.create(title, board.id);
      set({
        board: { ...board, lists: [...board.lists, { ...list, cards: list.cards || [] }] },
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  updateList: async (id: string, title: string) => {
    const { board } = get();
    if (!board) return;
    try {
      await api.lists.update(id, { title });
      set({
        board: {
          ...board,
          lists: board.lists.map((l) => (l.id === id ? { ...l, title } : l)),
        },
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  deleteList: async (id: string) => {
    const { board } = get();
    if (!board) return;
    // Optimistic
    const prevLists = board.lists;
    set({ board: { ...board, lists: board.lists.filter((l) => l.id !== id) } });
    try {
      await api.lists.delete(id);
    } catch (e) {
      set({ board: { ...board, lists: prevLists }, error: (e as Error).message });
    }
  },

  addCard: async (title: string, listId: string) => {
    const { board } = get();
    if (!board) return;
    try {
      const card = await api.cards.create(title, listId);
      set({
        board: {
          ...board,
          lists: board.lists.map((l) =>
            l.id === listId ? { ...l, cards: [...l.cards, card] } : l,
          ),
        },
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  updateCard: async (id: string, data) => {
    const { board } = get();
    if (!board) return;
    try {
      const updated = await api.cards.update(id, data);
      set({
        board: {
          ...board,
          lists: board.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) => (c.id === id ? { ...c, ...updated } : c)),
          })),
        },
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  deleteCard: async (id: string, listId: string) => {
    const { board } = get();
    if (!board) return;
    // Optimistic
    set({
      board: {
        ...board,
        lists: board.lists.map((l) =>
          l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== id) } : l,
        ),
      },
    });
    try {
      await api.cards.delete(id);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  // Optimistic local move (instant UI update)
  moveCard: (cardId, sourceListId, targetListId, newPosition) => {
    const { board } = get();
    if (!board) return;

    let card: Card | undefined;
    const newLists = board.lists.map((l) => {
      if (l.id === sourceListId) {
        const idx = l.cards.findIndex((c) => c.id === cardId);
        if (idx !== -1) {
          card = { ...l.cards[idx], position: newPosition, listId: targetListId };
          return { ...l, cards: l.cards.filter((c) => c.id !== cardId) };
        }
      }
      return l;
    });

    if (!card) return;

    const finalLists = newLists.map((l) => {
      if (l.id === targetListId) {
        const cards = [...l.cards, card!].sort((a, b) => a.position - b.position);
        return { ...l, cards };
      }
      return l;
    });

    set({ board: { ...board, lists: finalLists } });
  },

  // Reorder a card within the same list (swap positions with the card it's dragged over)
  reorderCardInList: (listId, activeCardId, overCardId) => {
    const { board } = get();
    if (!board) return;

    set({
      board: {
        ...board,
        lists: board.lists.map((l) => {
          if (l.id !== listId) return l;
          const cards = [...l.cards];
          const activeIdx = cards.findIndex((c) => c.id === activeCardId);
          const overIdx = cards.findIndex((c) => c.id === overCardId);
          if (activeIdx === -1 || overIdx === -1) return l;
          // Swap the two cards in the array
          const [moved] = cards.splice(activeIdx, 1);
          cards.splice(overIdx, 0, moved);
          return { ...l, cards };
        }),
      },
    });
  },

  // Persist move to backend
  commitMoveCard: async (cardId, targetListId, newPosition) => {
    try {
      await api.cards.move(cardId, { targetListId, newPosition });
    } catch (e) {
      // Refetch board on failure to restore correct state
      const { board } = get();
      if (board) get().fetchBoard(board.id);
      set({ error: (e as Error).message });
    }
  },
}));
