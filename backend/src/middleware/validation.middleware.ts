import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export function validateRequest(schema: z.ZodTypeAny, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: result.error.issues.map((issue) => ({
            field: issue.path.join(".") || "request",
            message: issue.message
          }))
        }
      });
    }

    req[source] = result.data;
    return next();
  };
}
