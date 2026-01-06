import { safeEqual } from '../../utils/string.js';

export const verifyToken = (provided: string | undefined, expected: string): boolean => {
  if (!provided || !expected) {
    return false;
  }
  return safeEqual(provided, expected);
};
