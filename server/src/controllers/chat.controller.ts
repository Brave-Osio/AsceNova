import type { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chatService.js';
import type { SendMessageInput } from '../validators/chat.validators.js';

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const messages = await chatService.getHistory(req.user!.id);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as SendMessageInput;
    const message = await chatService.sendMessage(req.user!.id, input.message);
    res.json({ message });
  } catch (err) {
    next(err);
  }
}
