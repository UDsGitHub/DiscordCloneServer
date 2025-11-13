import { AppUser } from "./AppUser.js";

export class FriendUser extends AppUser {
  serverInvites: string[];

  constructor(
    id: string,
    email: string,
    displayName: string,
    username: string,
    birthdate: string,
    serverInvites: string[]
  ) {
    super(id, email, displayName, username, birthdate);
    this.serverInvites = serverInvites;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      username: this.username,
      birthdate: this.birthdate.toISOString(),
      serverInvites: this.serverInvites
    };
  }
}
