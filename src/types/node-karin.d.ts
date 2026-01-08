declare module 'node-karin' {
  export const app: import('express').Application;

  export interface Contact {
    peer: string;
    scene: 'friend' | 'group';
  }

  export const contactFriend: (peer: string) => Contact;
  export const contactGroup: (peer: string) => Contact;

  export const sendMsg: (selfId: string, contact: Contact, elements: string) => Promise<void>;

  export const authMiddleware: (
    req: import('express').Request,
    res: import('express').Response,
    next: import('express').NextFunction
  ) => void;

  export const logger: {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
  };

  export const defineConfig: <T>(config: T) => T;
}
