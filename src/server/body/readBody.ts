import type { IncomingMessage } from 'http';
import { RequestError } from '../../utils/errors.js';
import type { ReadBodyResult } from '../types.js';

const getContentType = (req: IncomingMessage): string => {
  const header = req.headers['content-type'] as string | string[] | undefined;
  if (typeof header === 'string') {
    return header;
  }
  if (Array.isArray(header) && header.length > 0) {
    return header[0] ?? '';
  }
  return '';
};

export const readBody = async (req: IncomingMessage, limitBytes: number): Promise<ReadBodyResult> => {
  const chunks: Buffer[] = [];
  let total = 0;
  return new Promise((resolve, reject) => {
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new RequestError(413, 'BODY_TOO_LARGE', 'Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      const contentType = getContentType(req);
      const isJson = contentType.includes('application/json');
      if (!raw) {
        resolve({ raw: '', json: null, isJson });
        return;
      }
      if (isJson) {
        try {
          const parsed = JSON.parse(raw) as unknown;
          resolve({ raw, json: parsed, isJson: true });
          return;
        } catch {
          reject(new RequestError(400, 'INVALID_JSON', 'Invalid JSON body'));
          return;
        }
      }
      resolve({ raw, json: null, isJson: false });
    });
    req.on('error', () => {
      reject(new RequestError(400, 'READ_BODY_FAILED', 'Failed to read request body'));
    });
  });
};
