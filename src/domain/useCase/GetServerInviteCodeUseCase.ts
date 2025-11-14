import { ServerService } from "../service/implementation/ServerService.js";
import { BaseUseCase } from "./BaseUseCase.js";

export class GetServerInviteCodeUseCase extends BaseUseCase<
  [string],
  Promise<string>,
  string
> {
  private _BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  #serverService = new ServerService()

  async handle(serverId: string) {
    let version = 1
    let inviteCode = await this.#generateBase62Code(serverId, version);
    const serverInviteInfo = await this.#serverService.getServerInvite(
      serverId,
      inviteCode
    );
    
    if (serverInviteInfo["is_expired"]) {
      version = parseInt(serverInviteInfo["version"]) + 1;
      inviteCode = await this.#generateBase62Code(serverId, version);
      // this is odd but incase db fails we dont want to lie about invite code that doesnt exist
      inviteCode = await this.#serverService.updateServerInviteCode(
        serverId,
        inviteCode,
        version
      );
    } else {
      inviteCode = serverInviteInfo["invite_code"];
    }
    
    return inviteCode
  }

  #toBase62 = (uint8Array: Uint8Array) => {
    let num = BigInt(
      "0x" +
        Array.from(uint8Array)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
    );
    let out = "";
    while (num > 0n) {
      out = this._BASE62[Number(num % 62n)] + out;
      num /= 62n;
    }
    return out;
  };

  #generateBase62Code = async (uuid: string, version = 1) => {
    const enc = new TextEncoder();
    const data = enc.encode(uuid + ":" + version);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const uint8 = new Uint8Array(hashBuffer);

    const base62 = this.#toBase62(uint8);
    return base62.substring(0, 7);
  };
}
