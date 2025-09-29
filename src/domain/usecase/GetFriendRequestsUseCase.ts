import { FriendRequest } from "../businessObject/FriendRequest.js";
import { UserService } from "../service/interface/UserService.js";

export class GetFriendRequestsUseCase {
  #userService = new UserService();

  constructor() {}

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const friendRequestResponse = await this.#userService.getFriendRequests(
      userId
    );

    const requests: FriendRequest[] = [];
    for (const friendRequest of friendRequestResponse) {
      const senderUser = await this.#userService.getUserById(
        friendRequest.sender_id
      );
      if (!senderUser) continue;

      requests.push(
        new FriendRequest(
          this.#userService.createUserFromQueryResult(senderUser),
          friendRequest.direction,
          friendRequest.status
        )
      );
    }

    return Promise.all(requests);
  }
}
