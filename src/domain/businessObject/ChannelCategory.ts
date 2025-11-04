import { ServerChannel } from "./ServerChannel.js";

export class ChannelCategory {
  id: number;
  name: string;
  channels: ServerChannel[];

  constructor(id: number, name: string, channels: ServerChannel[]) {
    this.id = id;
    this.name = name;
    this.channels = channels;
  }

  toJSON() {
    const channels = this.channels.map((channel) => channel.toJSON());
    return {
      id: this.id,
      name: this.name,
      channels,
    };
  }
}
