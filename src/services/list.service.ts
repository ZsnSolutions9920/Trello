import { listRepository } from "@/repositories/list.repository";
import { AppError } from "@/lib/errors";

export const listService = {
  async create(title: string, boardId: string) {
    if (!title.trim()) throw new AppError(400, "Title is required");
    const agg = await listRepository.getMaxPosition(boardId);
    const position = (agg._max.position ?? 0) + 65536;
    return listRepository.create(title.trim(), boardId, position);
  },

  async update(id: string, data: { title?: string; position?: number }) {
    if (data.title !== undefined && !data.title.trim()) {
      throw new AppError(400, "Title cannot be empty");
    }
    return listRepository.update(id, {
      ...data,
      title: data.title?.trim(),
    });
  },

  async delete(id: string) {
    return listRepository.delete(id);
  },
};
