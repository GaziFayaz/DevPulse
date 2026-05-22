import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { successResponse } from "../../utils/response";
import * as issuesService from "./issues.service";
import { ValidationError } from "../../utils/errors";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      throw new ValidationError("Title, description, and type are required");
    }
    if (title.length > 150) {
      throw new ValidationError("Title must be at most 150 characters");
    }
    if (description.length < 20) {
      throw new ValidationError("Description must be at least 20 characters");
    }
    if (!["bug", "feature_request"].includes(type)) {
      throw new ValidationError("Type must be bug or feature_request");
    }

    const issue = await issuesService.create(title, description, type, req.user!.id);
    successResponse(res, issue, "Issue created successfully", StatusCodes.CREATED);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sort = (req.query.sort as string) || "newest";
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;

    const issues = await issuesService.getAll(sort, type, status);
    successResponse(res, issues);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const issue = await issuesService.getById(id);
    successResponse(res, issue);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const { title, description, type } = req.body;

    if (!title && !description && !type) {
      throw new ValidationError("At least one field (title, description, type) must be provided");
    }

    const issue = await issuesService.update(id, req.user!.id, req.user!.role, { title, description, type });
    successResponse(res, issue, "Issue updated successfully");
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id!, 10);
    await issuesService.remove(id);
    successResponse(res, null, "Issue deleted successfully");
  } catch (error) {
    next(error);
  }
};
