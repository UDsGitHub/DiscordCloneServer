import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { RegisterUserUseCase } from "../domain/useCase/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../domain/useCase/LoginUserUseCase.js";

export class AuthController {
  constructor() {}

  register = async (req: Request, res: Response) => {
    try {
      const { email, displayName, username, password, birthdate } = req.body;
      const registerUserUseCase = new RegisterUserUseCase();
      const responseData = await registerUserUseCase.execute({
        email,
        displayName,
        username,
        password,
        birthdate,
      });

      const token = jwt.sign(responseData.user, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res
        .status(201)
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 60 * 60 * 1000, // 1 hour
        })
        .json(responseData);
    } catch (error) {
      console.log(error);
      res.status(error.cause.status ?? 500).send(error.message);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      console.log(req.body);

      const loginUserUseCase = new LoginUserUseCase();
      const user = await loginUserUseCase.execute(email, password);

      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 60 * 60 * 1000,
        })
        .json({ user });
    } catch (error) {
      console.log(error);
      return res.status(error.cause?.status ?? 500).send(error.message);
    }
  };
}
