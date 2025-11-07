import { ServerChannel } from "../businessObject/ServerChannel.js";
import { ServerService } from "../service/implementation/ServerService.js";
import { BaseUseCase } from "./BaseUseCase.js";
import { GetChannelMessagesUseCase } from "./GetChannelMessagesUseCase.js";

export class GetChannelInfoUseCase extends BaseUseCase<[string], Promise<ServerChannel>, Record<string, any>> {
  #serverService = new ServerService();
  #getChannelMessageUseCase = new GetChannelMessagesUseCase();

  async handle(channelId: string) {
    const channelInfoResponse = await this.#serverService.getChannelInfo(
      channelId
    );
    const channelMessageIds = await this.#serverService.getChannelMessageIds(
      channelId
    );
    const channelMessages =
      await this.#getChannelMessageUseCase.getChannelMessages(
        channelId,
        channelMessageIds
      );

    return new ServerChannel(
      channelInfoResponse.id,
      channelInfoResponse.channel_name,
      channelInfoResponse.channel_topic,
      channelInfoResponse.channel_type,
      "",
      channelMessages,
      channelInfoResponse.category_id
    );
  }
}
