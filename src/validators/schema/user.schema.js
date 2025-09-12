import Joi from "joi";
import { genderEnum } from "../../common/enums/user.enum.js";
import { ageValidation } from "../../utils/general-rules.utils.js";


export const signUpSchema = {
    body: Joi.object({
        firstName: Joi.string()
            .trim()
            .min(2)
            .max(30)
            .required()
            .messages({
                "string.empty": "First name is required",
                "string.min": "First name must be at least 2 characters",
                "string.max": "First name must not exceed 30 characters"
            }),

        lastName: Joi.string()
            .trim()
            .min(2)
            .max(30)
            .required()
            .messages({
                "string.empty": "Last name is required",
                "string.min": "Last name must be at least 2 characters",
                "string.max": "Last name must not exceed 30 characters"
            }),

        gender: Joi.string()
            .valid(...Object.values(genderEnum))
            .required()
            .messages({
                "any.only": `Gender must be one of: ${Object.values(genderEnum)}`,
                "string.empty": "Gender is required"
            }),

        email: Joi.string()
            .email()
            .required()
            .messages({
                "string.email": "Email must be a valid email address",
                "string.empty": "Email is required"
            }),

        password: Joi.string()
            .pattern(/^[A-Za-z\d@$!%*]{8,25}$/)
            .required()
            .messages({
                "string.empty": "Password is required",
                "string.pattern.base": "Password must be 6-12 characters long and can only contain letters, numbers, and @$!%*"
            }),

        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({
                "any.only": "Passwords do not match",
                "string.empty": "Confirm password is required"
            }),

        phoneNumber: Joi.string()
            .pattern(/^\+?[0-9]{10,15}$/)
            .required()
            .messages({
                "string.empty": "Phone number is required",
                "string.pattern.base": "Phone number must contain only digits and can include an optional leading +"
            }),
        minAge: Joi.number().greater(18).optional(),
        maxAge: Joi.number().less(100).optional(),
        age: Joi.number().custom(ageValidation).required(),

    })
};

export const updateUserSchema = {
    body: Joi.object({
        firstName: Joi.string()
            .trim()
            .min(2)
            .max(30)
            .optional()
            .messages({
                "string.min": "First name must be at least 2 characters",
                "string.max": "First name must not exceed 30 characters"
            }),

        lastName: Joi.string()
            .trim()
            .min(2)
            .max(30)
            .optional()
            .messages({
                "string.min": "Last name must be at least 2 characters",
                "string.max": "Last name must not exceed 30 characters"
            }),

        gender: Joi.string()
            .valid(...Object.values(genderEnum))
            .optional()
            .messages({
                "any.only": `Gender must be one of: ${Object.values(genderEnum)}`
            }),

        email: Joi.string()
            .email()
            .optional()
            .messages({
                "string.email": "Email must be a valid email address"
            }),

        password: Joi.string()
            .pattern(/^[A-Za-z\d@$!%*]{8,25}$/)
            .optional()
            .messages({
                "string.pattern.base": "Password must be 8-25 characters long and can only contain letters, numbers, and @$!%*"
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .optional()
            .messages({
                "any.only": "Passwords do not match",
                "string.empty": "Confirm password is required"
            }),

        phoneNumber: Joi.string()
            .pattern(/^\+?[0-9]{10,15}$/)
            .optional()
            .messages({
                "string.pattern.base": "Phone number must contain only digits and can include an optional leading +"
            }),

        age: Joi.number()
            .optional()
            .custom(ageValidation)
    })
};









