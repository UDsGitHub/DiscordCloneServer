import { AppUser } from "../../businessObject/AppUser.js";
import { DefaultQueryObjectResult } from "../../usecase/index.js";

export interface IUserService {
  createUserFromQueryResult(row: DefaultQueryObjectResult): AppUser;

  getDmUsers(userId: string): Promise<DefaultQueryObjectResult[]>;

  addFriendById(userId: string, friendId: string): Promise<void>;

  insertMessage(fromId: string, toId: string, content: string): Promise<void>;

  getUserById(id: string): Promise<DefaultQueryObjectResult>;

  getUserByUsername(username: string): Promise<DefaultQueryObjectResult>;

  getUserByEmail(email: string): Promise<DefaultQueryObjectResult>;

  areWeFriends(userId: string, friendId: string): Promise<boolean>;

  outGoingFriendRequestExists(fromId: string, toId: string): Promise<boolean>;

  incomingFriendRequestExists(fromId: string, toId: string): Promise<boolean>;

  addFriendRequest(fromId: string, toId: string): Promise<void>;

  deleteFriend(userId: string, friendId: string): Promise<void>;

  deleteFriendRequest(userId: string, friendId: string): Promise<void>;

  getFriendUsers(userId: string): Promise<AppUser[]>;

  createUser(request: {
    id: string;
    email: string;
    displayName: string;
    username: string;
    password: string;
    birthdate: string;
  }): Promise<AppUser>;
}
