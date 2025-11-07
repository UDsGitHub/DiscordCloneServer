import bcrypt from "bcrypt";
import { UserService } from "../service/interface/UserService.js";
import { AppUser } from "../businessObject/AppUser.js";
import { BaseUseCase } from "./BaseUseCase.js";

export class LoginUserUseCase extends BaseUseCase<
  [string, string],
  Promise<AppUser>,
  Record<string, any>
> {
  #userService = new UserService();

  async handle(email: string, password: string): Promise<AppUser> {
    const user = await this.#userService.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found", { cause: { status: 400 } });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials!", { cause: { status: 400 } });
    }

    return this.#userService.createUserFromQueryResult(user);
  }
}
