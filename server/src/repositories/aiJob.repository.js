import aiJobModel from "../models/aiJob.model.js";

export const getAiJobId = async (id) => {
  return await aiJobModel.findById(id);
};
export const updateAiJobStatus = async (id, status, updates = {}) => {
  return await aiJobModel.findByIdAndUpdate(
    id,
    { status, ...updates },
    { returnDocument: "after", runValidators: true },
  );
};

// Only cancels jobs still in-flight ("pending"/"processing") — a job that
// already completed/failed/was cancelled is left untouched so a late or
// duplicate stop request can't clobber a real result.
export const cancelAiJobIfActive = async (id) => {
  return await aiJobModel.findOneAndUpdate(
    { _id: id, status: { $in: ["pending", "processing"] } },
    { status: "cancelled", cancelledAt: new Date() },
    { returnDocument: "after", runValidators: true },
  );
};
