import express from "express";
import { askAI } from "./ai";

const router = express.Router();

router.post("/ask", (req: any, res: any) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Нема прашање :/" });
  }

  const result = askAI(question);
  return res.json(result);
});

export default router;
