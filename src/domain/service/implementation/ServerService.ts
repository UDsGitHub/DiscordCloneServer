import pool from "../../../lib/database/index.js";
import { ChannelType, ServerRole } from "../../businessObject/ServerChannel.js";
import { DefaultQueryObjectResult } from "../../useCase/index.js";
import { IServerService } from "../interface/IServerService.js";
import { v4 as uuidv4 } from "uuid";

export class ServerService implements IServerService {
  constructor() {}

  async getChannelMessage(
    channelId: string,
    messageId: Number
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

  async getAllServers(): Promise<DefaultQueryObjectResult[]> {
    const queryResul = await pool.query(`SELECT * FROM servers s`);
    return queryResul.rows;
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

  async getChannelMessageIds(channelId: string): Promise<Number[]> {
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
  ): Promise<Number> {
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
    categoryId?: Number
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
    await pool.query(
      `INSERT INTO server_members(server_id, user_id, role)
          VALUES($1, $2, $3);`,
      [serverId, userId, role]
    );
  }

  async addChannelMessage(
    userId: string,
    channelId: string,
    content: string,
    timeStamp: string,
    refMessageId?: Number
  ): Promise<void> {
    await pool.query(
      `INSERT INTO channel_messages(channel_id, from_id, ref_message_id, message_content, time_stamp)
          VALUES($1, $2, $3, $4, $5);`,
      [channelId, userId, refMessageId, content, timeStamp]
    );
  }

  async deleteChannel(channelId: string): Promise<void> {
    await pool.query(`DELETE FROM channels WHERE id = $1`, [channelId]);
  }
}
