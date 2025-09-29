import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { UserService } from "../service/interface/UserService.js";
import { AppUser } from "../businessObject/AppUser.js";

type Response = {
  message: string;
  user: AppUser;
};

export class RegisterUserUseCase {
  #userService = new UserService();

  constructor() {}

  async registerUser(
    email: string,
    displayName: string,
    username: string,
    password: string,
    birthdate: string
  ): Promise<Response> {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // check if user already exists
    const userResponse = await this.#userService.getUserByEmail(email);
    if (!!userResponse) {
      throw new Error("User already exists", { cause: { status: 409 } });
    }

    // insert new user
    const newUser = await this.#userService.createUser({
      id: uuidv4(),
      email,
      displayName,
      username,
      password: passwordHash,
      birthdate,
    });

    return {
      message: "User inserted successfully",
      user: newUser,
    };
  }
}
