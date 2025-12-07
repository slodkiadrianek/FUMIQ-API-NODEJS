import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export class ValidationMiddleware {
  static validate(
    schema: ObjectSchema,
    property: "body" | "query" | "params" = "body"
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.body.email) {
        req.body.email = req.body.email.trim().toLowerCase();
      }
      const { error } = schema.validate(req[property], { abortEarly: false });
      if (error) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          error: {
            description: error.details[0].message,
          },
        });
        return;
      }
      
      next();
    };
  }
}
