import { NextFunction, Request, Response } from "express";
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  console.error(err.stack);
  res.status(500).send("Something broke!");
};

export default errorHandler;
