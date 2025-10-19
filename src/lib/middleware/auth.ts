import jwt from "jsonwebtoken";
import { AppUser } from "../../domain/businessObject/AppUser.js";
import { Request, Response, NextFunction } from "express";
import { DefaultQueryObjectResult } from "../../domain/useCase/index.js";

export type VerifyTokenRequest = Request & {
  user?: AppUser;
  file?: Express.Multer.File;
};

const verifyToken = async (
  req: VerifyTokenRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (token === undefined) {
    return res.status(401).send("No token provided");
  }

  try {
    const verifiedUser = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as DefaultQueryObjectResult;

    req.user = new AppUser(
      verifiedUser.id,
      verifiedUser.email,
      verifiedUser.displayName,
      verifiedUser.username,
      verifiedUser.birthdate
    );
    next();
  } catch (error) {
    console.log(error.message);
    res.status(403).json({ error: "Invalid token" });
  }
};

export default verifyToken;
