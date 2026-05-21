import type { NextFunction, Request, Response } from "express";
import fs from "node:fs";

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log("Method - URL - Time: ", req.method, req.url, Date.now());
  const log = `\nMethod-> ${req.method} - URL-> ${req.url} - Time-> ${Date.now()}`;
  fs.appendFile("logs.txt", log, (err) => {});
}

export default logger;