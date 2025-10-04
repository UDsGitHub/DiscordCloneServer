import { ChannelType, ServerRole } from "../businessObject/ServerChannel.js";
import { ServerService } from "../service/implementation/ServerService.js";
import { BaseUseCase } from "./BaseUseCase.js";

type Request = {
  userId: string;
  serverName: string;
  displayImagePath?: string;
};

type Response = {
  message: string,
  server: {id: string, name: string, displayPicture: string}
}

export class CreateServerUseCase extends BaseUseCase<[Request], Promise<Response>, Response> {
  #serverService = new ServerService();

  async handle(request: Request) {
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

    return {
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
