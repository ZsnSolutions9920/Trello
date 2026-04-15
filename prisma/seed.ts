import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  // Create dev user (login: dev@trello.local / password123)
  const user = await prisma.user.upsert({
    where: { id: "stub-user-001" },
    update: { password: hashedPassword },
    create: {
      id: "stub-user-001",
      email: "dev@trello.local",
      password: hashedPassword,
      name: "Dev User",
    },
  });

  console.log("Seeded user:", user.email);

  // Create a sample board
  const board = await prisma.board.upsert({
    where: { id: "sample-board-001" },
    update: {},
    create: {
      id: "sample-board-001",
      title: "My First Board",
      ownerId: user.id,
    },
  });

  // Create sample lists
  const todoList = await prisma.list.upsert({
    where: { id: "sample-list-todo" },
    update: {},
    create: {
      id: "sample-list-todo",
      title: "To-dos",
      position: 65536,
      boardId: board.id,
    },
  });

  const doingList = await prisma.list.upsert({
    where: { id: "sample-list-doing" },
    update: {},
    create: {
      id: "sample-list-doing",
      title: "In Progress",
      position: 131072,
      boardId: board.id,
    },
  });

  const doneList = await prisma.list.upsert({
    where: { id: "sample-list-done" },
    update: {},
    create: {
      id: "sample-list-done",
      title: "Completed",
      position: 196608,
      boardId: board.id,
    },
  });

  // Create sample cards
  await prisma.card.upsert({
    where: { id: "sample-card-1" },
    update: {},
    create: {
      id: "sample-card-1",
      title: "Set up project",
      position: 65536,
      listId: doneList.id,
    },
  });

  await prisma.card.upsert({
    where: { id: "sample-card-2" },
    update: {},
    create: {
      id: "sample-card-2",
      title: "Design database schema",
      position: 65536,
      listId: doingList.id,
    },
  });

  await prisma.card.upsert({
    where: { id: "sample-card-3" },
    update: {},
    create: {
      id: "sample-card-3",
      title: "Build frontend UI",
      position: 65536,
      listId: todoList.id,
    },
  });

  await prisma.card.upsert({
    where: { id: "sample-card-4" },
    update: {},
    create: {
      id: "sample-card-4",
      title: "Add drag and drop",
      position: 131072,
      listId: todoList.id,
    },
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
