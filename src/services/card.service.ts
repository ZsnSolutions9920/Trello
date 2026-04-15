import { cardRepository } from "@/repositories/card.repository";
import { AppError } from "@/lib/errors";

export const cardService = {
  async create(title: string, listId: string) {
    if (!title.trim()) throw new AppError(400, "Title is required");
    const agg = await cardRepository.getMaxPosition(listId);
    const position = (agg._max.position ?? 0) + 65536;
    return cardRepository.create(title.trim(), listId, position);
  },

  async update(id: string, data: { title?: string; description?: string | null }) {
    if (data.title !== undefined && !data.title.trim()) {
      throw new AppError(400, "Title cannot be empty");
    }
    return cardRepository.update(id, {
      ...data,
      title: data.title?.trim(),
    });
  },

  async delete(id: string) {
    return cardRepository.delete(id);
  },

  async move(id: string, targetListId: string, newPosition: number) {
    const card = await cardRepository.findById(id);
    if (!card) throw new AppError(404, "Card not found");
    return cardRepository.move(id, targetListId, newPosition);
  },
};
