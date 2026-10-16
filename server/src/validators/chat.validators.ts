import { z } from 'zod';

export const sendMessageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  /** True when the client is re-asking a message whose reply failed; the saved user message is reused, not duplicated. */
  retry: z.boolean().optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
