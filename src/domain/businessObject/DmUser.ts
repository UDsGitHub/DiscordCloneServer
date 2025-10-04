import { Message } from "./Message.js";

export class DmUser {
  userId: string;
  displayName: string;
  currentMessage: string;
  messageList: Message[];

  constructor(
    userId: string,
    displayName: string,
    currentMessage: string,
    messageList: Message[]
  ) {
    this.userId = userId;
    this.displayName = displayName;
    this.currentMessage = currentMessage;
    this.messageList = messageList;
  }

  toJSON() {
    const messageList = this.messageList.map((message) => message.toJSON());
    return {
      userId: this.userId,
      displayName: this.displayName,
      currentMessage: this.currentMessage,
      messageList,
    };
  }
}
