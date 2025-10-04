import { Message } from "./Message.js";

export enum ChannelType {
  TEXT,
  VOICE,
}

export enum ServerRole {
  ADMIN,
  MEMBER,
}

export class ServerChannel {
  id: string;
  name: string;
  topic: string;
  type: ChannelType;
  currentMessage: string;
  messages: Message[];
  categoryId?: Number;

  constructor(
    id: string,
    name: string,
    topic: string,
    type: ChannelType,
    currentMessage: string,
    messages: Message[],
    categoryId?: Number
  ) {
    this.id = id;
    this.name = name;
    this.topic = topic;
    this.type = type;
    this.currentMessage = currentMessage;
    this.messages = messages;
    this.categoryId = categoryId;
  }

  toJSON(): Record<string, any> {
    const messages = this.messages.map((message) => message.toJSON());
    return {
      id: this.id,
      name: this.name,
      topic: this.topic,
      type: this.type,
      currentMessage: this.currentMessage,
      messages: messages,
      categoryId: this.categoryId,
    };
  }
}
