import { ChannelCategory } from "./ChannelCategory.js";
import { ServerChannel } from "./ServerChannel.js";
import { ServerMember } from "./ServerMember.js";

export class Server {
  id: string;
  name: string;
  displayPicture: string;
  channels: ServerChannel[];
  lastSelectedChannel: string;
  categories: ChannelCategory[];
  members: ServerMember[];

  constructor(
    id: string,
    name: string,
    displayPicture: string,
    channels: ServerChannel[],
    lastSelectedChannel: string,
    categories: ChannelCategory[],
    members: ServerMember[]
  ) {
    this.id = id;
    this.name = name;
    this.displayPicture = displayPicture;
    this.channels = channels;
    this.lastSelectedChannel = lastSelectedChannel;
    this.categories = categories;
    this.members = members;
  }
}
