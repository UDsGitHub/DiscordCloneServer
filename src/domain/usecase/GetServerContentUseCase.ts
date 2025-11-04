import { ChannelCategory } from "../businessObject/ChannelCategory.js";
import { Server } from "../businessObject/Server.js";
import { ServerChannel } from "../businessObject/ServerChannel.js";
import { ServerMember } from "../businessObject/ServerMember.js";
import { ServerService } from "../service/implementation/ServerService.js";
import { GetChannelMessagesUseCase } from "./GetChannelMessagesUseCase.js";

export class GetServerContentUseCase {
  #serverService = new ServerService();
  #getChannelMessageUseCase = new GetChannelMessagesUseCase();

  constructor() {}

  async getServerContent(
    serverId: string,
    serverName: string,
    serverDisplayPicture: string
  ) {
    let channels = await this.#getChannels(serverId);
    const categories = await this.#getCategories(serverId, channels);
    const members = await this.#getMembers(serverId);
    const serverChannels = channels.filter((channel) => !channel.categoryId);

    // Update the first text channel with its messages for faster load times
    // const textChannels = channels.filter((channel) => channel.type === 0);
    // if (channels.length && textChannels.length) {
    //   const firstTextChannel = textChannels[0];
    //   const updatedFirstChannel = await this.#updateFirstChannel(
    //     firstTextChannel
    //   );

    //   channels = channels.map((channel) => {
    //     if (channel.id === firstTextChannel.id) {
    //       return updatedFirstChannel;
    //     }
    //     return channel;
    //   });
    // }

    return new Server(
      serverId,
      serverName,
      serverDisplayPicture,
      serverChannels,
      categories[0].channels[0].id,
      categories,
      members
    );
  }

  async #getCategories(serverId: string, channels: ServerChannel[]) {
    const categoriesResponse = await this.#serverService.getServerCategories(
      serverId
    );
    return categoriesResponse.map((category) => {
      const categoryChannels = channels.filter(
        (item) => item.categoryId === category.id
      );
      return new ChannelCategory(
        category.id,
        category.category_name,
        categoryChannels
      );
    });
  }

  async #getChannels(serverId: string) {
    const channelsResponse = await this.#serverService.getServerChannels(
      serverId
    );
    return channelsResponse.map(
      (channel) =>
        new ServerChannel(
          channel.id,
          channel.channel_name,
          channel.channel_topic,
          channel.channel_type,
          "",
          [],
          channel.category_id
        )
    );
  }

  async #getMembers(serverId: string) {
    const membersResponse = await this.#serverService.getServerMembers(serverId);

    return membersResponse.map(
      (member) =>
        new ServerMember(member.user_id, member.display_name, member.nickname)
    );
  }

  async #updateFirstChannel(firstTextChannel: ServerChannel) {
    const channelMessageIds = await this.#serverService.getChannelMessageIds(
      firstTextChannel.id
    );
    const channelMessages =
      await this.#getChannelMessageUseCase.getChannelMessages(
        firstTextChannel.id,
        channelMessageIds
      );

    firstTextChannel.messages = channelMessages;
    return firstTextChannel;
  }
}
