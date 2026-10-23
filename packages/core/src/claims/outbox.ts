import { appendFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

/**
 * Simulated e-mail sending. Nothing leaves the machine: approved claims are
 * kept in memory and, if OUTBOX_PATH is set, appended to a JSONL file.
 */
export interface OutboxMessage {
  id: string;
  to: string;
  subject: string;
  body: string;
  invoiceNumber: string;
  restaurantId: string;
  traceId: string | null;
  sentAt: string;
}

const sent: OutboxMessage[] = [];

export function sendClaim(msg: Omit<OutboxMessage, 'id' | 'sentAt'>): OutboxMessage {
  const message = { ...msg, id: randomUUID(), sentAt: new Date().toISOString() };
  sent.push(message);
  if (process.env.OUTBOX_PATH) appendFileSync(process.env.OUTBOX_PATH, JSON.stringify(message) + '\n');
  return message;
}

export const outbox = (): readonly OutboxMessage[] => sent;
