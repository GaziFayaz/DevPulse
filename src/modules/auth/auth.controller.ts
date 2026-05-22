import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { successResponse } from "../../utils/response";
import * as authService from "./auth.service";
import { ValidationError } from "../../utils/errors";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      throw new ValidationError("Name, email, password, and role are required");
    }

    const user = await authService.signup(name, email, password, role);
    successResponse(res, user, "User registered successfully", StatusCodes.CREATED);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const data = await authService.login(email, password);
    successResponse(res, data, "Login successful");
  } catch (error) {
    next(error);
  }
};
