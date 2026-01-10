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

  export interface ComponentOption {
    label: string;
    description?: string;
    defaultValue?: unknown;
    required?: boolean;
    options?: Array<{ label: string; value: string }>;
  }

  export type ComponentConfig = Record<string, unknown>;

  export const components: {
    switch: (field: string, options: ComponentOption) => ComponentConfig;
    input: (field: string, options: ComponentOption) => ComponentConfig;
    number: (field: string, options: ComponentOption) => ComponentConfig;
    password: (field: string, options: ComponentOption) => ComponentConfig;
    radio: (field: string, options: ComponentOption) => ComponentConfig;
    textarea: (field: string, options: ComponentOption) => ComponentConfig;
  };

  export const defineConfig: <T>(config: T) => T;
}
