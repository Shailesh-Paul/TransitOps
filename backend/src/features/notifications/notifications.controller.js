import ApiResponse from "../../core/ApiResponse.js";
import * as notificationsService from "./notifications.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getMyNotifications = asyncHandler(async (req, res, next) => {
  const { page, limit, status } = req.query;

  const result = await notificationsService.getMyNotifications(req.user.id, {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    status
  });

  ApiResponse.sendPaginated(res, result);
});

export const updateStatus = asyncHandler(async (req, res, next) => {
  await notificationsService.updateStatus(req.params.id, req.user.id, req.body.status);
  ApiResponse.send(res, null, `Notification marked as ${req.body.status}`);
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  await notificationsService.markAsRead(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Notification marked as read");
});

export const createNotification = asyncHandler(async (req, res, next) => {
  const { user_id, title, message, type, reference_id, reference_type } = req.body;
  const newId = await notificationsService.createSystemNotification({ 
    userId: user_id, 
    title, 
    message, 
    type, 
    reference_id, 
    reference_type 
  });
  ApiResponse.send(res, { id: newId }, "Notification sent successfully", 201);
});

export const getPreferences = asyncHandler(async (req, res, next) => {
  const prefs = await notificationsService.getMyPreferences(req.user.id);
  ApiResponse.send(res, prefs, "Preferences retrieved");
});

export const updatePreference = asyncHandler(async (req, res, next) => {
  const { notification_type, in_app, email } = req.body;
  await notificationsService.updateMyPreference(req.user.id, notification_type, in_app, email);
  ApiResponse.send(res, null, "Preference updated successfully");
});

export const markAllAsRead = asyncHandler(async (req, res, next) => {
  const affected = await notificationsService.markAllAsRead(req.user.id);
  ApiResponse.send(res, { marked: affected }, "All unread notifications marked as read");
});

export const deleteNotification = asyncHandler(async (req, res, next) => {
  await notificationsService.deleteNotification(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Notification deleted successfully");
});

export const getNotificationCounts = asyncHandler(async (req, res, next) => {
  const counts = await notificationsService.getNotificationCounts(req.user.id);
  ApiResponse.send(res, counts, "Notification counts retrieved");
});

export const getNotificationHistory = asyncHandler(async (req, res, next) => {
  const history = await notificationsService.getNotificationHistory(req.params.id, req.user.id);
  ApiResponse.send(res, history, "Notification history retrieved");
});
