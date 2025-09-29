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
  ) {}
}
