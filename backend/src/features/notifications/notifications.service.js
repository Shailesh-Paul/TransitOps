import notificationsRepository from "./notifications.repository.js";
import { NotFoundError } from "../../core/errors.js";
import NotificationEngine from "../../core/NotificationEngine.js";

export const getMyNotifications = async (userId, options) => {
  return await notificationsRepository.findByUserId(userId, options);
};

export const updateStatus = async (id, userId, status) => {
  const success = await notificationsRepository.updateStatus(id, userId, status);
  if (!success) {
    throw new NotFoundError("Notification not found or unauthorized");
  }
  return true;
};

// Backwards compatibility for the old markAsRead route
export const markAsRead = async (id, userId) => {
  return await updateStatus(id, userId, 'read');
};

export const createSystemNotification = async (payload) => {
  return await NotificationEngine.dispatch(payload);
};

export const getMyPreferences = async (userId) => {
  return await notificationsRepository.getPreferences(userId);
};

export const updateMyPreference = async (userId, type, inApp, email) => {
  return await notificationsRepository.updatePreference(userId, type, inApp, email);
};

export const markAllAsRead = async (userId) => {
  return await notificationsRepository.markAllAsRead(userId);
};

export const deleteNotification = async (id, userId) => {
  const success = await notificationsRepository.delete(id, userId);
  if (!success) {
    throw new NotFoundError("Notification not found or unauthorized");
  }
  return true;
};

export const getNotificationCounts = async (userId) => {
  return await notificationsRepository.getCounts(userId);
};

export const getNotificationHistory = async (id, userId) => {
  const history = await notificationsRepository.getHistory(id, userId);
  if (!history) {
    throw new NotFoundError("Notification not found or unauthorized");
  }
  return history;
};
