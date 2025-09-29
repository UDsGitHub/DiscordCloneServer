import { UserService } from "../service/interface/UserService.js";

export class SendFriendRequestUseCase {
  #userService = new UserService();

  constructor() {}

  async sendFriendRequest(
    fromUserId: string,
    toUsername: string
  ): Promise<string> {
    // check if user exists
    const friendUser = await this.#userService.getUserByUsername(toUsername);
    if (!friendUser) {
      throw new Error(`User with username: ${toUsername} does not exist`, {
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
