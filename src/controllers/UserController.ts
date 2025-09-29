import { Response } from "express";
import { UserService } from "../domain/service/interface/UserService.js";
import { VerifyTokenRequest } from "../lib/middleware/auth.js";
import { GetDmUsersUseCase } from "../domain/usecase/GetDmUsersUseCase.js";
import { SendFriendRequestUseCase } from "../domain/usecase/SendFriendRequestUseCase.js";
import { GetFriendRequestsUseCase } from "../domain/usecase/GetFriendRequestsUseCase.js";

export class UserController {
  #userService = new UserService();

  constructor() {}

  async getUser(req: VerifyTokenRequest, res: Response) {
    try {
      return res
        .status(200)
        .json(this.#userService.createUserFromQueryResult(req.user));
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }

  async getDmUsers(req: VerifyTokenRequest, res: Response) {
    try {
      const user = req.user;
      const getDmUsersUseCase = new GetDmUsersUseCase();
      const dmUsers = await getDmUsersUseCase.getDmUsers(user.id);

      return res.status(200).json(dmUsers);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }

  async sendMessageToUser(req: VerifyTokenRequest, res: Response) {
    try {
      const user = req.user;
      const { toUserId, message } = req.body;

      await this.#userService.insertMessage(user.id, toUserId, message);

      return res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }

  async sendFriendRequest(req: VerifyTokenRequest, res: Response) {
    try {
      const user = req.user;
      const { toUsername } = req.body;

      const sendFriendRequestUseCase = new SendFriendRequestUseCase();
      const responseMessage = await sendFriendRequestUseCase.sendFriendRequest(
        user.id,
        toUsername
      );

      return res.status(200).json({ message: responseMessage });
    } catch (error) {
      return res.status(error.cause.status ?? 500).send(error.message);
    }
  }

  async getFriendRequests(req: VerifyTokenRequest, res: Response) {
    try {
      const user = req.user;

      const getFriendRequestsUseCase = new GetFriendRequestsUseCase();
      const friendRequestResponse =
        await getFriendRequestsUseCase.getFriendRequests(user.id);

      return res.status(200).json(friendRequestResponse);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }

  async addFriend(req: VerifyTokenRequest, res: Response) {
    try {
      const user = req.user;
      const { friendId } = req.body;

      // check if they are already friends
      const alreadyFriends = await this.#userService.areWeFriends(
        user.id,
        friendId
      );
      if (alreadyFriends) {
        return res
          .status(409)
          .json({ message: `Already friends with user: ${friendId}` });
      }

      this.#userService.addFriendById(user.id, friendId);
      return res.status(200).json({ message: "Added new friend!" });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }

  async unFriend(req: VerifyTokenRequest, res: Response) {
    try {
      const user = req.user;
      const { friendId } = req.body;

      await this.#userService.deleteFriend(user.id, friendId);

      return res.status(200).json({ message: `Unfriended user: ${friendId}` });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }

  async ignoreFriendRequest(req: VerifyTokenRequest, res: Response) {
    try {
      const user = req.user;
      const { friendId } = req.body;

      // check if user exists
      const userExists = await this.#userService.getUserById(friendId);
      if (!!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      await this.#userService.deleteFriendRequest(user.id, friendId);

      return res.status(200).json({ message: "Ignored friend request" });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  }

  getFriends = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const user = req.user;

      const friendUsers = await this.#userService.getFriendUsers(user.id);

      return res.status(200).json(friendUsers);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };
}
