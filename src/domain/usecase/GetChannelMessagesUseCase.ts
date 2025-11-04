import { Message } from "../businessObject/Message.js";
import { ServerService } from "../service/implementation/ServerService.js";

export class GetChannelMessagesUseCase {
  serverService = new ServerService();

  constructor() {}

  async getChannelMessages(channelId: string, messageIds: number[]) {
    const channelMessages: Message[] = [];
    for (const messageId of messageIds) {
      const channelMessage = await this.serverService.getChannelMessage(
        channelId,
        messageId
      );
      if (!channelMessage) continue;

      const refMessage = await this.#getRefMessage(
        channelId,
        channelMessage.ref_message_id ?? undefined
      );

      const message = new Message(
        channelMessage.id,
        channelMessage.message_content,
        channelMessage.time_stamp,
        {
          userId: channelMessage.user_id,
          displayName: channelMessage.display_name,
        },
        refMessage
      );

      channelMessages.push(message);
    }

    return Promise.all(channelMessages);
  }

  async #getRefMessage(
    channelId: string,
    refMessageId?: number
  ): Promise<Message | undefined> {
    if (!refMessageId) return undefined;

    const refMessage = await this.serverService.getChannelMessage(
      channelId,
      refMessageId
    );
    if (!refMessage) return undefined;

    return new Message(
      refMessage.id,
      refMessage.message_content,
      new Date(refMessage.time_stamp),
      {
        userId: refMessage.user_id,
        displayName: refMessage.display_name,
      },
      undefined
    );
  }
}
