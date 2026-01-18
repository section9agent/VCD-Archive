import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_req, res) => {
  const items = await prisma.item.findMany();
  res.json(items);
});

router.post("/", async (req, res) => {
  const item = await prisma.item.create({
    data: req.body,
  });
  res.json(item);
});

export default router;
