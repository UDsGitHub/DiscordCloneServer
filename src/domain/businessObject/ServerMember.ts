export class ServerMember {
  userId: string;
  displayName: string;
  nickname?: string;

  constructor(userId: string, displayName: string, nickname?: string) {
    this.userId = userId;
    this.displayName = displayName;
    this.nickname = nickname;
  }
}
