import { ChannelType, ServerRole } from "../../businessObject/ServerChannel.js";
import { DefaultQueryObjectResult } from "../../useCase/index.js";

export interface IServerService {
  getChannelMessage(
    channelId: string,
    messageIds: number
  ): Promise<DefaultQueryObjectResult | undefined>;

  getUserServers(userId: string): Promise<DefaultQueryObjectResult[]>;

  getAllServers(): Promise<DefaultQueryObjectResult[]>;

  getServerCategories(serverId: string): Promise<DefaultQueryObjectResult[]>;

  getServerChannels(serverId: string): Promise<DefaultQueryObjectResult[]>;

  getServerMembers(serverId: string): Promise<DefaultQueryObjectResult[]>;

  getChannelMessageIds(channelId: string): Promise<number[]>;

  getChannelInfo(
    channelId: string
  ): Promise<DefaultQueryObjectResult | undefined>;

  createServer(serverName: string, displayImagePath?: string): Promise<string>;

  createServerCategory(serverId: string, categoryName: string): Promise<number>;

  createServerChannel(
    serverId: string,
    channelName: string,
    channelType: ChannelType,
    categoryId?: number
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
    refMessageId?: number
  ): Promise<number>;

  deleteChannel(channelId: string): Promise<void>;

  getServerInvite(
    serverId: string,
    inviteCode: string
  ): Promise<DefaultQueryObjectResult>;

  updateServerInviteCode(
    serverId: string,
    inviteCode: string,
    version: number
  ): Promise<string>;
}
