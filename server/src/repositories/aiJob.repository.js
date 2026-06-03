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
