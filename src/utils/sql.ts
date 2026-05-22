import { pool } from "../db";

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};
