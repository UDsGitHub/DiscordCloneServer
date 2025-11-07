import { FriendRequest } from "../businessObject/FriendRequest.js";
import { UserService } from "../service/interface/UserService.js";
import { BaseUseCase } from "./BaseUseCase.js";

type Response = Record<string, any>[];

export class GetFriendRequestsUseCase extends BaseUseCase<[string], Promise<Response>, Response> {
  #userService = new UserService();

  async handle(userId: string): Promise<Response> {
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
    
    const output = requests.map(request => request.toJSON())

    return Promise.all(output);
  }
}
