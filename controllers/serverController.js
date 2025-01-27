import { v4 as uuidv4 } from "uuid";
import pool from "../database/index.js";
import { config } from "../config/index.js";

export const getServers = async (req, res) => {
  try {
    const query = await pool.query(`SELECT * FROM servers s`);

    const servers = query.rows.map((server) => ({
      id: server.id,
      name: server.server_name,
      displayPicture: server.server_dp,
    }));

    res.status(200).json(servers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getChannelMessage = (channelId, messageIds) => {
  const channelMessages = messageIds.map(async (messageId) => {
    const messageQuery = await pool.query(
      `SELECT cm.id, cm.content, cm.timestamp, u.id as user_id, u.username, u.display_name, u.user_dp
            FROM channel_messages cm
            INNER JOIN users u ON cm.from_id = u.id
            WHERE channel_id = $1 AND cm.id = $2;`,
      [channelId, messageId]
    );

    const refMessageId = messageQuery.rows[0].ref_message_id ?? undefined;
    let refMessage = undefined;
    if (refMessageId) {
      const refMessageQuery = await pool.query(
        `SELECT cm.id, cm.content, cm.timestamp, u.id as user_id, u.username, u.display_name, u.user_dp
                FROM channel_messages cm
                INNER JOIN users u ON cm.from_id = u.id
                WHERE channel_id = $1 AND cm.id = $2;`,
        [channelId, refMessageId]
      );
      refMessage = {
        id: refMessageQuery.rows[0].id,
        content: refMessageQuery.rows[0].content,
        timestamp: refMessageQuery.rows[0].timestamp,
        author: {
          userId: refMessageQuery.rows[0].user_id,
          displayName: refMessageQuery.rows[0].display_name,
        },
        refMessage: undefined,
      };
    }

    const message = {
      id: messageQuery.rows[0].id,
      content: messageQuery.rows[0].content,
      timestamp: messageQuery.rows[0].timestamp,
      author: {
        userId: messageQuery.rows[0].user_id,
        displayName: messageQuery.rows[0].display_name,
      },
      refMessage: refMessage,
    };
    return message;
  });

  return channelMessages;
};

export const getServer = async (req, res) => {
  try {
    const serverId = req.params.id;
    const serverQuery = await pool.query(
      `SELECT * FROM servers WHERE id = $1;`,
      [serverId]
    );
    const server = {
      id: serverQuery.rows[0].id,
      name: serverQuery.rows[0].server_name,
      displayPicture: serverQuery.rows[0].server_dp,
      channels: [],
    };
    const categoriesQuery = await pool.query(
      `SELECT * FROM categories WHERE server_id = $1;`,
      [serverId]
    );
    const categories = categoriesQuery.rows.map((category) => ({
      categoryId: category.id,
      categoryName: category.category_name,
      channels: [],
    }));
    const channelsQuery = await pool.query(
      `SELECT * FROM channels WHERE server_id = $1;`,
      [serverId]
    );
    const channels = channelsQuery.rows.map((channel) => ({
      id: channel.id,
      categoryId: channel.category_id,
      name: channel.channel_name,
      topic: channel.channel_topic,
      type: channel.channel_type,
      messages: [],
    }));

    const channelMessageIds = await pool.query(
      `SELECT id 
        FROM channel_messages cm
        WHERE channel_id = $1;`,
      [channels[0].channelId]
    );
    const channelMessages = getChannelMessage(
      channels[0].channelId,
      channelMessageIds.rows.map((message) => message.id)
    );

    channels[0].messages = await Promise.all(channelMessages);

    categories.forEach((category) => {
      category.channels = channels.filter((channel) => {
        if (channel.categoryId === category.categoryId) {
          return channel;
        } else {
          server.channels.push(channel);
        }
      });
    });

    server.categories = categories;
    return res.status(200).json(server);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChannelInfo = async (req, res) => {
  try {
    const serverId = req.params.id;
    const channelId = req.params.channelId;
    const channelQuery = await pool.query(
      `SELECT * FROM channels WHERE server_id = $1 AND id = $2;`,
      [serverId, channelId]
    );
    const channel = {
      id: channelQuery.rows[0].id,
      categoryId: channelQuery.rows[0].category_id,
      name: channelQuery.rows[0].channel_name,
      topic: channelQuery.rows[0].channel_topic,
      type: channelQuery.rows[0].channel_type,
      messages: [],
    };

    const channelMessageIds = await pool.query(
      `SELECT id 
            FROM channel_messages cm
            WHERE channel_id = $1;`,
      [channelId]
    );
    const channelMessages = getChannelMessage(
      channelId,
      channelMessageIds.rows.map((message) => message.id)
    );

    channel.messages = await Promise.all(channelMessages);

    return res.status(200).json(channel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createServer = async (req, res) => {
  try {
    const user = req.user;
    const { serverName } = req.body;
    const serverDisplayPicture = req.file;

    let imagePath = undefined;
    if (serverDisplayPicture) {
      imagePath = `${req.protocol}://${req.get("host")}/${config.uploadPath}${
        serverDisplayPicture.filename
      }`;
    }

    // check if user is already in server
    const query = await pool.query(
      `INSERT INTO servers(id, server_name, server_dp)
          VALUES($1, $2, $3) RETURNING id;`,
      [uuidv4(), serverName, imagePath]
    );

    const serverId = query.rows[0].id;
    // create default categories and channels
    const categoryQuery = await pool.query(
      `INSERT INTO categories(server_id, category_name)
        VALUES ($1, $2), ($1, $3) RETURNING id;`,
      [serverId, "TEXT CHANNELS", "VOICE CHANNELS"]
    );

    categoryQuery.rows.forEach(async (category) => {
      await pool.query(
        `INSERT INTO channels(id, server_id, category_id, channel_name, channel_type)
        VALUES ($1, $3, $4, $5, 0), ($2, $3, $4, $6, 1);`,
        [uuidv4(), uuidv4(), serverId, category.id, "general", "General"]
      );
    });

    // add user to server as admin
    await pool.query(
      `INSERT INTO server_members(server_id, user_id, role)
          VALUES($1, $2, 0);`,
      [serverId, user.id]
    );

    const responseData = {
      message: "Server created successfully",
      server: {
        name: serverName,
        displayPicture: imagePath,
      },
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
