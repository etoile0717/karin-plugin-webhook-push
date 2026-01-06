import type { Application, Request, Response, NextFunction } from 'express';

declare module 'node-karin' {
  export const app: Application;

  export interface Contact {
    peer: string;
    scene: 'friend' | 'group';
  }

  export const contactFriend: (peer: string) => Contact;
  export const contactGroup: (peer: string) => Contact;

  export const sendMsg: (selfId: string, contact: Contact, elements: string) => Promise<void>;

  export const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;

  export const logger: {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
  };
}
