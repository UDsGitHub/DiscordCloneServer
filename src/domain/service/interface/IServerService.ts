import { ChannelType, ServerRole } from "../../businessObject/ServerChannel.js";
import { DefaultQueryObjectResult } from "../../useCase/index.js";

export interface IServerService {
  getChannelMessage(
    channelId: string,
    messageIds: Number
  ): Promise<DefaultQueryObjectResult | undefined>;

  getAllServers(): Promise<DefaultQueryObjectResult[]>;

  getServerCategories(serverId: string): Promise<DefaultQueryObjectResult[]>;

  getServerChannels(serverId: string): Promise<DefaultQueryObjectResult[]>;

  getServerMembers(serverId: string): Promise<DefaultQueryObjectResult[]>;

  getChannelMessageIds(channelId: string): Promise<Number[]>;

  getChannelInfo(
    channelId: string
  ): Promise<DefaultQueryObjectResult | undefined>;

  createServer(serverName: string, displayImagePath?: string): Promise<string>;

  createServerCategory(serverId: string, categoryName: string): Promise<Number>;

  createServerChannel(
    serverId: string,
    channelName: string,
    channelType: ChannelType,
    categoryId?: Number
  ): Promise<void>;

  addServerMemeber(
    serverId: string,
    userId: string,
    role: ServerRole
  ): Promise<void>;

  addChannelMessage(
    userId: string,
    channelId: string,
    content: string,
    timeStamp: string,
    refMessageId?: Number
  ): Promise<void>;

  deleteChannel(channelId: string): Promise<void>;
}
