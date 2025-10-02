import { AppUser } from "./AppUser.js";

export enum FriendRequestDirection {
  INCOMING,
  OUTGOING,
}

export enum FriendRequestStatus {
  PENDING,
  ACCEPTED,
  DENIED,
}

export class FriendRequest {
  user: AppUser;
  direction: FriendRequestDirection;
  status: FriendRequestStatus;

  constructor(
    user: AppUser,
    direction: FriendRequestDirection,
    status: FriendRequestStatus
  ) {
    this.user = user;
    this.direction = direction;
    this.status = status;
  }

  toString() {
    return {
      user: this.user,
      direction: this.direction,
      status: this.status,
    };
  }
}
