import { app, sendMsg, contactFriend, contactGroup, authMiddleware, logger } from 'node-karin';
import { registerRoutes } from './server/registerRoutes.js';
import { ConfigStore } from './config/configStore.js';

const store = new ConfigStore();

registerRoutes(
  app,
  {
    sendMsg,
    contactFriend,
    contactGroup,
    authMiddleware,
    logger
  },
  store
);
