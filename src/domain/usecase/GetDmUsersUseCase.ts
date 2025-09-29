import { DmUser } from "../businessObject/DmUser.js";
import { Message } from "../businessObject/Message.js";
import { UserService } from "../service/interface/UserService.js";

export class GetDmUsersUseCase {
  #userService = new UserService();
  constructor() {}

  async getDmUsers(userId: string) {
    /** // TODO: 
    optimize this by getting only the userids and profile pictures
    only get message log for first dmuser in table
    later on get messages when user clicks on the dmuser **/
    
    const dmUsersResponse = await this.#userService.getDmUsers(userId);

    const dmUsersResult = {};
    for (const user of dmUsersResponse) {
      if (!dmUsersResult[user.to_id]) {
        const dmUser = new DmUser(user.to_id, user.display_name, "", [
          new Message(
            user.id,
            user.message_content,
            new Date(user.created_at),
            { userId: user.from_id, displayName: user.display_name },
            undefined
          ),
        ]);
        dmUsersResult[user.to_id] = dmUser;
      } else {
        const message = new Message(
          user.id,
          user.message_content,
          new Date(user.created_at),
          { userId: user.from_id, displayName: user.display_name },
          undefined
        );
        dmUsersResult[user["to_id"]].messageList.push(message);
      }
    }
  }
}
