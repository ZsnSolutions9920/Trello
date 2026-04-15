import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "@/repositories/user.repository";
import { AppError } from "@/lib/errors";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const TOKEN_EXPIRY = "7d";

export interface JwtPayload {
  userId: string;
}

export const authService = {
  async register(email: string, password: string, name?: string) {
    if (!email?.trim()) throw new AppError(400, "Email is required");
    if (!password || password.length < 6) {
      throw new AppError(400, "Password must be at least 6 characters");
    }

    const existing = await userRepository.findByEmail(email.toLowerCase());
    if (existing) throw new AppError(409, "Email already registered");

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await userRepository.create(
      email.toLowerCase().trim(),
      hashedPassword,
      name?.trim(),
    );

    const token = jwt.sign({ userId: user.id } satisfies JwtPayload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, teamId: user.teamId } };
  },

  async login(email: string, password: string) {
    if (!email?.trim()) throw new AppError(400, "Email is required");
    if (!password) throw new AppError(400, "Password is required");

    const user = await userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) throw new AppError(401, "Invalid email or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, "Invalid email or password");

    const token = jwt.sign({ userId: user.id } satisfies JwtPayload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, teamId: user.teamId } };
  },

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      throw new AppError(401, "Invalid or expired token");
    }
  },
};
