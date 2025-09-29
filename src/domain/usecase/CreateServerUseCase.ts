import { ChannelType, ServerRole } from "../businessObject/ServerChannel.js";
import { ServerService } from "../service/implementation/ServerService.js";

export type CreateServerRequest = {
  userId: string;
  serverName: string;
  displayImagePath?: string;
};

export class CreateServerUseCase {
  #serverService = new ServerService();

  constructor() {}

  async createServer(request: CreateServerRequest) {
    const { userId, serverName, displayImagePath } = request;

    const serverId = await this.#serverService.createServer(
      serverName,
      displayImagePath
    );

    /* CREATE DEFAULT CATEGORIES AND CHANNELS */
    await this.#createDefaultCategoriesAndChannels(serverId);

    /* ADD USER AS ADMIN MEMBER */
    await this.#serverService.addServerMemeber(
      serverId,
      userId,
      ServerRole.ADMIN
    );

    const responseData = {
      message: "Server created successfully",
      server: {
        id: serverId,
        name: serverName,
        displayPicture: displayImagePath,
      },
    };
  }

  async #createDefaultCategoriesAndChannels(serverId: string) {
    const textCategoryId = await this.#serverService.createServerCategory(
      serverId,
      "TEXT CHANNELS"
    );
    const voiceCategoryId = await this.#serverService.createServerCategory(
      serverId,
      "VOICE CHANNELS"
    );

    await this.#serverService.createServerChannel(
      serverId,
      "general",
      ChannelType.TEXT,
      textCategoryId
    );
    await this.#serverService.createServerChannel(
      serverId,
      "General",
      ChannelType.VOICE,
      voiceCategoryId
    );
  }
}
