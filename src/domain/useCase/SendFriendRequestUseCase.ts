import { UserService } from "../service/interface/UserService.js";
import { BaseUseCase } from "./BaseUseCase.js";

export class SendFriendRequestUseCase extends BaseUseCase<
  [string, string | undefined, string | undefined],
  Promise<string>,
  string
> {
  #userService = new UserService();

  async handle(
    fromUserId: string,
    toUsername?: string,
    toUserId?: string
  ): Promise<string> {
    if (!toUsername && !toUserId) {
      throw new Error("Please provide to-username or to-userid", {
        cause: { status: 400 },
      });
    }

    let friendUser = undefined;
    // check if user exists
    if (toUsername) {
      friendUser = await this.#userService.getUserByUsername(toUsername);
    } else {
      friendUser = await this.#userService.getUserById(toUserId);
    }

    if (!friendUser) {
      const message = toUsername
        ? `User with username: ${toUsername} does not exist`
        : `User with userId: ${toUserId} does not exist`;

      throw new Error(message, {
        cause: { status: 404 },
      });
    }

    // check if they are already friends
    const alreadyFriends = await this.#userService.areWeFriends(
      fromUserId,
      friendUser.id
    );
    if (alreadyFriends) {
      throw new Error(`You are already friends with ${toUsername}`, {
        cause: { status: 409 },
      });
    }

    const outGoingFriendRequestExists =
      await this.#userService.outGoingFriendRequestExists(
        fromUserId,
        friendUser.id
      );
    if (outGoingFriendRequestExists) {
      throw new Error(`Friend request already exists`, {
        cause: { status: 409 },
      });
    }

    // if incoming friend request exists, accept it and make them friends
    const incomingFriendRequestExists =
      await this.#userService.incomingFriendRequestExists(
        fromUserId,
        friendUser.id
      );
    if (incomingFriendRequestExists) {
      this.#userService.addFriendById(fromUserId, friendUser.id);
      return `You are now friends with ${toUsername}`;
    }

    await this.#userService.addFriendRequest(fromUserId, friendUser.id);
    return "Friend request sent";
  }
}
