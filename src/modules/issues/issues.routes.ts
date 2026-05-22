import { Router } from "express";
import authenticate from "../../middleware/authenticate";
import authorize from "../../middleware/authorize";
import * as issuesController from "./issues.controller";

const router = Router();

router.get("/", issuesController.getAll);
router.get("/:id", issuesController.getById);
router.post("/", authenticate, issuesController.create);
router.patch("/:id", authenticate, issuesController.update);
router.delete("/:id", authenticate, authorize("maintainer"), issuesController.remove);

export default router;
