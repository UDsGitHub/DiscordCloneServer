import { Server } from "../businessObject/Server.js";
import { ServerService } from "../service/implementation/ServerService.js";
import { BaseUseCase } from "./BaseUseCase.js";
import { GetServerContentUseCase } from "./GetServerContentUseCase.js";

export class GetServersUseCase extends BaseUseCase<
  [string],
  Promise<Server[]>,
  Record<string, any>
> {
  #serverService = new ServerService();
  #getServerContentUseCase = new GetServerContentUseCase();

  async handle(userId: string): Promise<Server[]> {
    const allServers = await this.#serverService.getUserServers(userId);

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
