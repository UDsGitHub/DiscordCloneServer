import pool from "../../../lib/database/index.js";
import { ChannelType, ServerRole } from "../../businessObject/ServerChannel.js";
import { DefaultQueryObjectResult } from "../../useCase/index.js";
import { IServerService } from "../interface/IServerService.js";
import { v4 as uuidv4 } from "uuid";
import { ServerPreview } from "../../useCase/GetServerForInviteCodeUseCase.js";

export class ServerService implements IServerService {
  constructor() {}

  async getChannelMessage(
    channelId: string,
    messageId: number
  ): Promise<DefaultQueryObjectResult | undefined> {
    const queryResult = await pool.query(
      `SELECT cm.id, cm.message_content, cm.ref_message_id, cm.time_stamp, u.id as user_id, u.username, u.display_name
            FROM channel_messages cm
            INNER JOIN users u ON cm.from_id = u.id
            WHERE cm.channel_id = $1 AND cm.id = $2;`,
      [channelId, messageId]
    );
    return queryResult.rows[0];
  }

  async getUserServers(userId: string): Promise<DefaultQueryObjectResult[]> {
    const queryResul = await pool.query(
      `SELECT * FROM servers s INNER JOIN server_members sm ON sm.server_id = s.id WHERE sm.user_id = $1`,
      [userId]
    );
    return queryResul.rows;
  }

  async getAllServers(): Promise<DefaultQueryObjectResult[]> {
    const queryResult = await pool.query(`SELECT * FROM servers`);
    return queryResult.rows;
  }

  async getServerCategories(
    serverId: string
  ): Promise<DefaultQueryObjectResult[]> {
    const queryResult = await pool.query(
      `SELECT * FROM categories WHERE server_id = $1;`,
      [serverId]
    );
    return queryResult.rows ?? [];
  }

  async getServerChannels(
    serverId: string
  ): Promise<DefaultQueryObjectResult[]> {
    const queryResult = await pool.query(
      `SELECT * FROM channels WHERE server_id = $1;`,
      [serverId]
    );

    return queryResult.rows ?? [];
  }

  async getServerMembers(
    serverId: string
  ): Promise<DefaultQueryObjectResult[]> {
    const queryResult = await pool.query(
      `SELECT u.id, u.display_name, sm.nickname
      FROM server_members sm 
      INNER JOIN users u ON sm.user_id = u.id
      WHERE server_id = $1`,
      [serverId]
    );
    return queryResult.rows ?? [];
  }

  async getChannelMessageIds(channelId: string): Promise<number[]> {
    const queryResult = await pool.query(
      `SELECT id 
        FROM channel_messages
        WHERE channel_id = $1;`,
      [channelId]
    );

    return queryResult.rows.map((message) => message.id) ?? [];
  }

  async getChannelInfo(
    channelId: string
  ): Promise<DefaultQueryObjectResult | undefined> {
    const queryResult = await pool.query(
      `SELECT * FROM channels WHERE id = $1;`,
      [channelId]
    );
    return queryResult.rows[0];
  }

  async createServer(
    serverName: string,
    displayImagePath?: string
  ): Promise<string> {
    const queryResult = await pool.query(
      `INSERT INTO servers(id, server_name, server_dp)
          VALUES($1, $2, $3) RETURNING id;`,
      [uuidv4(), serverName, displayImagePath]
    );

    return queryResult.rows[0].id;
  }

  async createServerCategory(
    serverId: string,
    categoryName: string
  ): Promise<number> {
    const queryResult = await pool.query(
      `INSERT INTO categories(server_id, category_name)
        VALUES ($1, $2) RETURNING id;`,
      [serverId, categoryName]
    );

    return queryResult.rows[0].id;
  }

  async createServerChannel(
    serverId: string,
    channelName: string,
    channelType: ChannelType,
    categoryId?: number
  ): Promise<void> {
    await pool.query(
      `INSERT INTO channels(id, server_id, channel_name, channel_type, category_id)
        VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), serverId, channelName, channelType, categoryId]
    );
  }

  async addServerMemeber(
    serverId: string,
    userId: string,
    role: ServerRole
  ): Promise<void> {
    if (this.#alreadyInServer(serverId, userId)) return;
    
    await pool.query(
      `INSERT INTO server_members(server_id, user_id, role)
          VALUES($1, $2, $3);`,
      [serverId, userId, role]
    );
  }

  async #alreadyInServer(serverId: string, userId: string) {
    const query = await pool.query(
      'SELECT * FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, userId]
    )
    
    return query.rowCount > 0
  }

  async addChannelMessage(
    userId: string,
    channelId: string,
    content: string,
    timeStamp: string,
    refMessageId?: number
  ): Promise<number> {
    const id = await pool.query(
      `INSERT INTO channel_messages(channel_id, from_id, ref_message_id, message_content, time_stamp)
          VALUES($1, $2, $3, $4, $5) RETURNING id;`,
      [channelId, userId, refMessageId, content, timeStamp]
    );

    return id.rows[0];
  }

  async deleteChannel(channelId: string): Promise<void> {
    await pool.query(`DELETE FROM channels WHERE id = $1`, [channelId]);
  }

  async getServerInvite(
    serverId: string,
    inviteCode: string
  ): Promise<DefaultQueryObjectResult> {
    const query = await pool.query(
      "SELECT * FROM server_invites WHERE server_id = $1 and invite_code = $2",
      [serverId, inviteCode]
    );

    if (!query.rowCount) {
      const insertQuery = await pool.query(
        "INSERT INTO server_invites (server_id, invite_code) VALUES($1, $2) RETURNING *",
        [serverId, inviteCode]
      );
      return insertQuery.rows[0];
    } else {
      return query.rows[0];
    }
  }

  async updateServerInviteCode(
    serverId: string,
    inviteCode: string,
    version: number
  ): Promise<string> {
    await pool.query("DELETE FROM server_invites WHERE server_id = $1", [
      serverId,
    ]);

    const insertQuery = await pool.query(
      "INSERT INTO server_invites (server_id, invite_code, version) VALUES($1, $2, $3) RETURNING *",
      [serverId, inviteCode, version]
    );
    return insertQuery.rowCount ? insertQuery.rows[0].invite_code : "";
  }

  async getServerForInviteCode(
    inviteCode: string
  ): Promise<ServerPreview | undefined> {
    const serverIdQuery = await pool.query(
      "SELECT server_id FROM server_invites WHERE invite_code = $1",
      [inviteCode]
    );

    if (serverIdQuery.rowCount) {
      const getServerPreviewQuery = await pool.query(
        "SELECT id, server_name, server_dp FROM servers WHERE id = $1",
        [serverIdQuery.rows[0]["server_id"]]
      );

      const result = getServerPreviewQuery.rowCount
        ? getServerPreviewQuery.rows[0]
        : undefined;
      const serverPreviewInfo =
        result !== undefined
          ? {
              id: result["id"],
              name: result["server_name"],
              displayPicture: result["server_dp"],
            }
          : undefined;
      return serverPreviewInfo;
    }
  }
}
