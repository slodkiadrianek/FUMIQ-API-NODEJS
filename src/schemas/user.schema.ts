import Joi, { ObjectSchema } from "joi";

export const registerUser: ObjectSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character. It must be at least 8 characters long.",
    }),
  email: Joi.string().email().custom((val: string) => {
    const splitted = val.split("@")
    if (splitted[1] !== "zs2.ostrzeszow.pl") {
      throw new Error("You have to use zs2.ostrzeszow.pl domain")
    }
    return val
  }).required().messages({
    'any.custom': 'Please use your school email address ending with @zs2.ostrzeszow.pl'
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password")) // Must match "password"
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});

export const userId: ObjectSchema = Joi.object({
  userId: Joi.string().required(),
});

export const loginUser: ObjectSchema = Joi.object({
  email: Joi.string().email().custom((val: string) => {
    const splitted = val.split("@")
    if (splitted[1] !== "zs2.ostrzeszow.pl") {
      throw new Error("You have to use zs2.ostrzeszow.pl domain")
    }
    return val
  }).required().messages({
    'any.custom': 'Please use your school email address ending with @zs2.ostrzeszow.pl'
  }),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character. It must be at least 8 characters long.",
    }),
});

export const emailUser: ObjectSchema = Joi.object({
  email: Joi.string().email().custom((val: string) => {
    const splitted = val.split("@")
    if (splitted[1] !== "zs2.ostrzeszow.pl") {
      throw new Error("You have to use zs2.ostrzeszow.pl domain")
    }
    return val
  }).required().messages({
    'any.custom': 'Please use your school email address ending with @zs2.ostrzeszow.pl'
  }),
});

export const passwordUser: ObjectSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character. It must be at least 8 characters long.",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});

export const changePasswordUser: ObjectSchema = Joi.object({
  oldPassword: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character. It must be at least 8 characters long.",
    }),
  newPassword: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character. It must be at least 8 characters long.",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword")) // Must match "password"
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});

export const deleteUser: ObjectSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character. It must be at least 8 characters long.",
    }),
});

export const updateUser: ObjectSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().custom((val: string) => {
    const splitted = val.split("@")
    if (splitted[1] !== "zs2.ostrzeszow.pl") {
      throw new Error("You have to use zs2.ostrzeszow.pl domain")
    }
    return val
  }).required().messages({
    'any.custom': 'Please use your school email address ending with @zs2.ostrzeszow.pl'
  }),
});

export const token: ObjectSchema = Joi.object({
  token: Joi.string().required(),
});
