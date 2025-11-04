import { Response } from "express";
import { UserService } from "../domain/service/interface/UserService.js";
import { VerifyTokenRequest } from "../lib/middleware/auth.js";
import { GetDmUsersUseCase } from "../domain/useCase/GetDmUsersUseCase.js";
import { SendFriendRequestUseCase } from "../domain/useCase/SendFriendRequestUseCase.js";
import { GetFriendRequestsUseCase } from "../domain/useCase/GetFriendRequestsUseCase.js";

export class UserController {
  #userService = new UserService();

  constructor() {}

  getUser = async (req: VerifyTokenRequest, res: Response) => {
    try {
      return res.status(200).json(req.user.toJSON());
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };

  getDmUsers = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const user = req.user;
      const getDmUsersUseCase = new GetDmUsersUseCase();
      const dmUsers = await getDmUsersUseCase.execute(user.id);

      return res.status(200).json(dmUsers);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };

  sendMessageToUser = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const user = req.user;
      const { toUserId, message } = req.body;

      await this.#userService.insertMessage(user.id, toUserId, message);

      return res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };

  sendFriendRequest = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const user = req.user;
      const { toUsername } = req.body;

      const sendFriendRequestUseCase = new SendFriendRequestUseCase();
      const responseMessage = await sendFriendRequestUseCase.execute(
        user.id,
        toUsername
      );

      return res.status(200).json({ message: responseMessage });
    } catch (error) {
      return res.status(error.cause.status ?? 500).send(error.message);
    }
  };

  getFriendRequests = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const user = req.user;

      const getFriendRequestsUseCase = new GetFriendRequestsUseCase();
      const friendRequestResponse = await getFriendRequestsUseCase.execute(
        user.id
      );

      return res.status(200).json(friendRequestResponse);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };

  addFriend = async (req: VerifyTokenRequest, res: Response) => {
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
  };

  unFriend = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const user = req.user;
      const { friendId } = req.body;

      await this.#userService.deleteFriend(user.id, friendId);

      return res.status(200).json({ message: `Unfriended user: ${friendId}` });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };

  ignoreFriendRequest = async (req: VerifyTokenRequest, res: Response) => {
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
  };

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
