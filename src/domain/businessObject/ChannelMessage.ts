import { Message, MessageAuthor } from "./Message.js";

export class ChannelMessage extends Message {
  constructor(
    id: number,
    content: string,
    timestamp: Date,
    author: MessageAuthor,
    refMessage: ChannelMessage | undefined
  ) {
    super(id, content, timestamp, author, refMessage);
  }
}
