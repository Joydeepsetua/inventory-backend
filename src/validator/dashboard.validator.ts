import Joi from "joi";

export const dashboardSummarySchema = Joi.object({
  days: Joi.number().integer().min(1).max(31).default(7),
  tz_offset: Joi.number().integer().min(-840).max(840).default(0).messages({
    "number.min": "tz_offset must be between -840 and 840 minutes",
    "number.max": "tz_offset must be between -840 and 840 minutes",
  }),
});
