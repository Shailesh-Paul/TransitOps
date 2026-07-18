import Joi from "joi";

export const updateSettingSchema = {
  params: Joi.object({
    key: Joi.string().required(),
  }),
  body: Joi.object({
    setting_value: Joi.string().required().messages({ "any.required": "Setting value cannot be empty" }),
    description: Joi.string().optional(),
  }),
};

export const getSettingSchema = {
  params: Joi.object({
    key: Joi.string().required(),
  }),
};
