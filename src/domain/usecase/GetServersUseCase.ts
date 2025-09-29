import { Server } from "../businessObject/Server.js";
import { ServerService } from "../service/implementation/ServerService.js";
import { GetServerContentUseCase } from "./GetServerContentUseCase.js";

export class GetServersUseCase {
  #serverService = new ServerService();
  #getServerContentUseCase = new GetServerContentUseCase();

  constructor() {}

  async getServers(): Promise<Server[]> {
    const allServers = await this.#serverService.getAllServers();

    return await Promise.all(
      allServers.map(async (serverData) => {
        const serverContent =
          await this.#getServerContentUseCase.getServerContent(
            serverData.id,
            serverData.server_name,
            serverData.server_dp
          );
        return serverContent;
      })
    );
  }
}
