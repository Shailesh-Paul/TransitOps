import Joi from "joi";
import { idSchema } from "../../validators/common.schema.js";

export const createNotificationSchema = {
  body: Joi.object({
    user_id: idSchema.required(),
    title: Joi.string().max(150).required(),
    message: Joi.string().required(),
    type: Joi.string().valid('SYSTEM', 'EXPIRY', 'ASSIGNMENT', 'APPROVAL').optional(),
    reference_id: idSchema.optional().allow(null),
    reference_type: Joi.string().max(50).optional().allow(null, ""),
  }),
};

export const updateStatusSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('read', 'archived', 'dismissed').required(),
  })
};

export const markAsReadSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
};

export const updatePreferenceSchema = {
  body: Joi.object({
    notification_type: Joi.string().valid('SYSTEM', 'EXPIRY', 'ASSIGNMENT', 'APPROVAL').required(),
    in_app: Joi.boolean().required(),
    email: Joi.boolean().required(),
  })
};

export const deleteNotificationSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
};

export const notificationHistorySchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
};
