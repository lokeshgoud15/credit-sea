import { Router } from "express";
import uploadRouter from "./upload.js";
import {
  getAllReports,
  getReportById,
} from "../controllers/reportcontroller.js";

const router = Router();

router.use("/upload", uploadRouter);

router.get("/reports", getAllReports);
router.get("/reports/:id", getReportById);

export default router;
