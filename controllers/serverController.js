import { v4 as uuidv4 } from "uuid";
import pool from "../database/index.js";
import { config } from "../config/index.js";

export const getServers = async (req, res) => {
  try {
    const query = await pool.query(`SELECT * FROM servers s`);

    const servers = await Promise.all(
      query.rows.map(async (serverData) => {
        const serverContent = await getServerContent(
          serverData.id,
          serverData.server_name,
          serverData.server_dp
        );
        return serverContent;
      })
    );

    res.status(200).json(servers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getChannelMessage = (channelId, messageIds) => {
  const channelMessages = messageIds.map(async (messageId) => {
    const messageQuery = await pool.query(
      `SELECT cm.id, cm.message_content, cm.ref_message_id, cm.time_stamp, u.id as user_id, u.username, u.display_name
            FROM channel_messages cm
            INNER JOIN users u ON cm.from_id = u.id
            WHERE cm.channel_id = $1 AND cm.id = $2;`,
      [channelId, messageId]
    );

    const refMessageId = messageQuery.rows[0].ref_message_id ?? undefined;
    let refMessage = undefined;
    if (refMessageId) {
      const refMessageQuery = await pool.query(
        `SELECT cm.id, cm.content, cm.time_stamp, u.id as user_id, u.username, u.display_name
                FROM channel_messages cm
                INNER JOIN users u ON cm.from_id = u.id
                WHERE channel_id = $1 AND cm.id = $2;`,
        [channelId, refMessageId]
      );
      refMessage = {
        id: refMessageQuery.rows[0].id,
        content: refMessageQuery.rows[0].message_content,
        timestamp: refMessageQuery.rows[0].time_stamp,
        author: {
          userId: refMessageQuery.rows[0].user_id,
          displayName: refMessageQuery.rows[0].display_name,
        },
        refMessage: undefined,
      };
    }

    const message = {
      id: messageQuery.rows[0].id,
      content: messageQuery.rows[0].message_content,
      timestamp: messageQuery.rows[0].time_stamp,
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

const getServerContent = async (serverId, serverName, serverDisplayPicture) => {
  const server = {
    id: serverId,
    name: serverName,
    displayPicture: serverDisplayPicture,
    channels: [],
  };

  const categoriesQuery = await pool.query(
    `SELECT * FROM categories WHERE server_id = $1;`,
    [serverId]
  );
  const categories = categoriesQuery.rows.map((category) => ({
    id: category.id,
    name: category.category_name,
    channels: [],
  }));
  const channelsQuery = await pool.query(
    `SELECT * FROM channels WHERE server_id = $1;`,
    [serverId]
  );
  let channels = channelsQuery.rows.map((channel) => ({
    id: channel.id,
    categoryId: channel.category_id,
    name: channel.channel_name,
    topic: channel.channel_topic,
    type: channel.channel_type,
    currentMessage: "",
    messages: [],
  }));

  const membersQuery = await pool.query(
    `SELECT u.id, u.display_name, sm.nickname
      FROM server_members sm 
      INNER JOIN users u ON sm.user_id = u.id
      WHERE server_id = $1`,
    [serverId]
  );

  const members = membersQuery.rows.map((member) => ({
    userId: member.user_id,
    displayName: member.display_name,
    nickname: member.nickname,
  }));

  if (channels.length) {
    const textChannels = channels.filter((channel) => channel.type === 0);
    if (textChannels.length) {
      const channelMessageIds = await pool.query(
        `SELECT id 
        FROM channel_messages
        WHERE channel_id = $1;`,
        [textChannels[0].id]
      );

      const channelMessages = getChannelMessage(
        textChannels[0].id,
        channelMessageIds.rows.map((message) => message.id)
      );

      textChannels[0].messages = await Promise.all(channelMessages);

      channels = channels.map((channel) => {
        if (channel.id === textChannels[0].id) {
          return textChannels[0];
        }
        return channel;
      });
    }
  }

  categories.forEach((category) => {
    category.channels = channels.filter((channel) => {
      if (channel.categoryId === category.id) {
        return channel;
      } else {
        server.channels.push(channel);
      }
    });
  });

  server.channels = channels.filter((channel) => !channel.categoryId);
  server.lastSelectedChannel = categories[0].channels[0].id;
  server.categories = categories;
  server.members = members;

  return server;
};

export const getChannelInfo = async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const channelQuery = await pool.query(
      `SELECT * FROM channels WHERE id = $1;`,
      [channelId]
    );
    const channel = {
      id: channelQuery.rows[0].id,
      categoryId: channelQuery.rows[0].category_id,
      name: channelQuery.rows[0].channel_name,
      topic: channelQuery.rows[0].channel_topic,
      type: channelQuery.rows[0].channel_type,
      currentMessage: "",
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

    categoryQuery.rows.forEach(async (category, index) => {
      if (index == 0) {
        await pool.query(
          `INSERT INTO channels(id, server_id, category_id, channel_name, channel_type)
        VALUES ($1, $2, $3, $4, 0)`,
          [uuidv4(), serverId, category.id, "general"]
        );
      } else {
        await pool.query(
          `INSERT INTO channels(id, server_id, category_id, channel_name, channel_type)
        VALUES ($1, $2, $3, $4, 1)`,
          [uuidv4(), serverId, category.id, "General"]
        );
      }
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

export const sendChannelMessage = async (req, res) => {
  try {
    const {
      channelId,
      author: { userId },
      content,
      timeStamp,
      refMessageId,
    } = req.body;

    await pool.query(
      `INSERT INTO channel_messages(channel_id, from_id, ref_message_id, message_content, time_stamp)
          VALUES($1, $2, $3, $4, $5);`,
      [channelId, userId, refMessageId, content, timeStamp]
    );

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createChannel = async (req, res) => {
  try {
    const { name, type, serverId, categoryId } = req.body;

    const channelQuery = await pool.query(
      `INSERT INTO channels(id, server_id, channel_name, channel_type, category_id)
          VALUES($1, $2, $3, $4, $5) RETURNING id;`,
      [uuidv4(), serverId, name, type, categoryId]
    );

    res.status(200).json({id: channelQuery.rows[0].id});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
