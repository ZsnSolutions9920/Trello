import { boardRepository } from "@/repositories/board.repository";
import { teamRepository } from "@/repositories/team.repository";
import { userRepository } from "@/repositories/user.repository";
import { AppError } from "@/lib/errors";

export const boardService = {
  async getAllForUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    if (user.role === "admin") {
      return boardRepository.findAllByUser(userId);
    }

    if (!user.teamId) {
      return [];
    }

    const team = await teamRepository.findById(user.teamId);
    if (!team) {
      return [];
    }

    return boardRepository.findAllByUser(team.adminId);
  },

  async getById(id: string, userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    const board = await boardRepository.findByIdWithLists(id);
    if (!board) throw new AppError(404, "Board not found");

    if (user.role === "admin") {
      if (board.ownerId !== userId) {
        throw new AppError(403, "You are not allowed to access this board");
      }
    } else {
      if (!user.teamId) {
        throw new AppError(403, "You are not allowed to access this board");
      }

      const team = await teamRepository.findById(user.teamId);
      if (!team || board.ownerId !== team.adminId) {
        throw new AppError(403, "You are not allowed to access this board");
      }
    }

    // Strip the owner object, expose only the Discord connected flag
    const { owner, ...rest } = board;
    return {
      ...rest,
      ownerDiscordConnected: !!owner?.discordId,
    };
  },

  async create(title: string, ownerId: string) {
    if (!title.trim()) throw new AppError(400, "Title is required");

    const user = await userRepository.findById(ownerId);
    if (!user) throw new AppError(404, "User not found");
    if (user.role !== "admin") {
      throw new AppError(403, "Only admins can create boards");
    }

    return boardRepository.create(title.trim(), ownerId, user.teamId);
  },

  async update(id: string, title: string, userId: string) {
    if (!title.trim()) throw new AppError(400, "Title is required");

    const board = await boardRepository.findById(id);
    if (!board) throw new AppError(404, "Board not found");
    if (board.ownerId !== userId) {
      throw new AppError(403, "Only the board owner can update this board");
    }

    return boardRepository.update(id, title.trim());
  },

  async delete(id: string, userId: string) {
    const board = await boardRepository.findById(id);
    if (!board) throw new AppError(404, "Board not found");
    if (board.ownerId !== userId) {
      throw new AppError(403, "Only the board owner can delete this board");
    }

    return boardRepository.delete(id);
  },
};
