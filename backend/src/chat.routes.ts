import express from "express";
import { askruleBased } from "./chat";

const router = express.Router();

router.post("/ask", (req: any, res: any) => {
  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Нема прашање :/" });
  }

  const result = askruleBased(question, context);
  return res.json(result);
});

export default router;
