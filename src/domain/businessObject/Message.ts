export type MessageAuthor = {
  userId: string;
  displayName: string;
};

export class Message {
  id: Number;
  content: string;
  timestamp: Date;
  author: MessageAuthor;
  refMessage: Message | undefined;

  constructor(
    id: Number,
    content: string,
    timestamp: Date,
    author: MessageAuthor,
    refMessage: Message | undefined
  ) {
    this.id = id;
    this.content = content;
    this.timestamp = timestamp;
    this.author = author;
    this.refMessage = refMessage;
  }

  toString(): Record<string, any> {
    return {
      id: this.id,
      content: this.content,
      timestamp: this.timestamp,
      author: this.author,
      refMessage: this.refMessage.toString(),
    };
  }
}
