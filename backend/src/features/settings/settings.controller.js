import ApiResponse from "../../core/ApiResponse.js";
import * as settingsService from "./settings.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllSettings = asyncHandler(async (req, res, next) => {
  const result = await settingsService.getAllSettings();
    ApiResponse.sendPaginated(res, result);
});

export const getSettingByKey = asyncHandler(async (req, res, next) => {
  const setting = await settingsService.getSettingByKey(req.params.key);
    ApiResponse.send(res, setting);
});

export const updateSettingByKey = asyncHandler(async (req, res, next) => {
  await settingsService.updateSettingByKey(req.params.key, req.body, req.user.id);
    ApiResponse.send(res, null, `System setting '${req.params.key}' updated successfully`);
});
