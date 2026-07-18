import { NotFoundError } from "../../core/errors.js";
import settingsRepository from "./settings.repository.js";

export const getAllSettings = async () => {
  // Simple retrieval of all settings, usually not paginated as it's configuration
  return await settingsRepository.findAll({ page: 1, limit: 100 });
};

export const getSettingByKey = async (key) => {
  const setting = await settingsRepository.findByKey(key);
  if (!setting) {
    throw new NotFoundError(`Setting configuration for '${key}' not found`);
  }
  return setting;
};

export const updateSettingByKey = async (key, updateData, updatedBy) => {
  const setting = await settingsRepository.findByKey(key);
  if (!setting) {
    throw new NotFoundError(`Setting configuration for '${key}' not found`);
  }

  const payload = {
    setting_value: updateData.setting_value,
    updated_by: updatedBy,
  };

  if (updateData.description !== undefined) {
    payload.description = updateData.description;
  }

  await settingsRepository.updateByKey(key, payload);
};
