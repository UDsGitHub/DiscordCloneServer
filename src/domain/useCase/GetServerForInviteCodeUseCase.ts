import { Server } from "../businessObject/Server.js";
import { ServerService } from "../service/implementation/ServerService.js";
import { BaseUseCase } from "./BaseUseCase.js";

// TODO modify this to include a boolean in the server preview that says 
// if the person is already a member of the server so they dont have to 
// join again instead just navigate to server
export type ServerPreview = Pick<Server, "id" | "name" | "displayPicture">;

export class GetServerForInviteCodeUseCase extends BaseUseCase<
  [string],
  Promise<ServerPreview | undefined>,
  ServerPreview | undefined
> {
  #serverService = new ServerService();

  async handle(inviteCode: string) {
    const response = await this.#serverService.getServerForInviteCode(
      inviteCode
    );
    return response;
  }
}
