import Report from "../models/Report.js";
import { parseExperianXml } from "../services/xmlParser.js";
import logger from "../logger.js";
import mongoose from "mongoose";

// Parse the XML buffer and save a Report document. Returns the new doc's id.
export async function parseAndSaveReport(xmlBuffer) {
  const parsed = await parseExperianXml(xmlBuffer);
  const doc = new Report({
    basic: parsed.basic,
    summary: parsed.summary,
    creditAccounts: parsed.creditAccounts,
    raw: parsed.rawRoot,
  });
  const saved = await doc.save();
  logger.info("Report saved", { id: saved._id });
  return saved._id.toString();
}

export async function getAllReports(req, res) {
  try {
    const list = await Report.find({}, { raw: 0 })
      .sort({ uploadedAt: -1 })
      .limit(200);
    res.json(list);
  } catch (err) {
    logger.error("getAllReports failed", { message: err.message });
    res.status(500).json({ error: err.message });
  }
}

export async function getReportById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid id" });
    const doc = await Report.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (err) {
    logger.error("getReportById failed", { message: err.message });
    res.status(500).json({ error: err.message });
  }
}
