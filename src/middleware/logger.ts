import type { NextFunction, Request, Response } from "express";
import fs from "node:fs";

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`Method-> ${req.method} - URL-> ${req.url} - Time-> ${new Date().toISOString()}`);
  next();
}

export default logger;