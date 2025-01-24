import pool from "../database.js";

export const getUser = async (req, res) => {
  try {
    return res.status(200).json(createUserFromQueryResult(req.user));
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const getDmUsers = async (req, res) => {
  try {
    const user = req.user;

    // insert new user
    const dmUsersQuery = await pool.query(
      `SELECT (SELECT username FROM users where id = m.to_id) as username, m.* FROM messages m INNER JOIN users u ON m.from_id = u.id WHERE u.id = $1 ORDER BY m.time_stamp`,
      [user.id]
    );

    const dmUsersResult = {};
    for (const user of dmUsersQuery.rows) {
      if (!dmUsersResult[user["to_id"]]) {
        dmUsersResult[user["to_id"]] = {
          userId: user["to_id"],
          username: user["username"],
          currentMessage: "",
          messageList: [
            {
              id: user["id"],
              fromId: user["from_id"],
              toId: user["to_id"],
              message: user["message_content"],
              timeStamp: new Date(user["created_at"]),
            },
          ],
        };
      } else {
        dmUsersResult[user["to_id"]].messageList.push({
          id: user["id"],
          fromId: user["from_id"],
          toId: user["to_id"],
          message: user["message_content"],
          timeStamp: new Date(user["created_at"]),
        });
      }
    }

    return res.status(200).json(dmUsersResult);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const sendMessageToUser = async (req, res) => {
  try {
    const user = req.user;
    const { toUserId, message } = req.body;

    // insert new user
    await pool.query(
      `INSERT INTO messages (from_id, to_id, message_content)
      VALUES ($1, $2, $3);`,
      [user.id, toUserId, message]
    );

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const user = req.user;
    const { toUsername } = req.body;

    // check if user exists
    const userQuery = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [toUsername]
    );
    if (userQuery.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const toUser = userQuery.rows[0];

    // check if they are already friends
    const friendsQuery = await pool.query(
      `SELECT * 
      FROM bidirectional_friends bf
      JOIN users u1 ON bf.user_id = u1.id
      JOIN users u2 ON bf.friend_id = u2.id
      WHERE (u1.username = $1 AND u2.username = $2)
      OR (u1.username = $2 AND u2.username = $1);
    `,
    [user.id, toUser.id]
    );

    if (friendsQuery.rowCount > 0) {
      return res
        .status(409)
        .json({ message: `Already friends with user: ${toUsername}` });
    }

    const outGoingFriendRequestQuery = await pool.query(
      `SELECT * FROM friend_requests WHERE from_id = $1 and to_id = $2 AND status != 1`,
      [user.id, toUser.id]
    );
    if (outGoingFriendRequestQuery.rowCount > 0) {
      return res.status(409).json({ message: "Friend request already exists" });
    }

    const incomingFriendRequestQuery = await pool.query(
      `SELECT * FROM friend_requests WHERE to_id = $1 AND from_id = $2 AND status = 0`,
      [user.id, toUser.id]
    );
    if (incomingFriendRequestQuery.rowCount > 0) {
      addFriendById(user.id, toUser.id);
      return res
        .status(200)
        .json({ message: `You are now friends with ${toUsername}` });
    }

    await pool.query(
      "INSERT INTO friend_requests (from_id, to_id) VALUES ($1, $2);",
      [user.id, toUser.id]
    );

    return res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const user = req.user;

    // insert new user
    const friendRequestQuery = await pool.query(
      `SELECT 
      CASE WHEN from_id = $1 THEN to_id ELSE from_id END AS sender_id,
      CASE WHEN from_id = $1 THEN 0 ELSE 1 END AS direction, 
      status 
      FROM friend_requests
      WHERE (to_id = $1 OR from_id = $1) AND status = 0 ORDER BY created_at DESC;`,
      [user.id]
    );

    const friendRequestResult = await Promise.all(
      friendRequestQuery.rows.map(async (row) => {
        const userQuery = await pool.query(
          "SELECT * FROM users WHERE users.id = $1",
          [row["sender_id"]]
        );
        if (userQuery.rowCount !== 0) {
          const result = {
            user: createUserFromQueryResult(userQuery.rows[0]),
            direction: row["direction"],
            status: row["status"],
          };
          return result;
        }
      })
    );

    // Filter out any null results and return only valid user objects
    return res.status(200).json(friendRequestResult);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const addFriend = async (req, res) => {
  try {
    const user = req.user;
    const { friendId } = req.body;

    // check if they are already friends
    const friendsQuery = await pool.query(
      "SELECT friend_id FROM bidirectional_friends WHERE user_id = $1 AND friend_id = $2",
      [user.id, friendId]
    );
    if (friendsQuery.rowCount > 0) {
      return res
        .status(409)
        .json({ message: `Already friends with user: ${friendId}` });
    }

    // @Throws errors
    addFriendById(user.id, friendId)

    return res.status(200).json({ message: "Added new friend!" });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const unFriend = async (req, res) => {
  try {
    const user = req.user;
    const { friendId } = req.body;

    // check if they are already friends
    await pool.query(
      "DELETE friends WHERE user_id = $1 AND friend_id = $2;",
      [user.id, friendId]
    );

    return res.status(200).json({ message: `Unfriended user: ${friendId}` });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export const ignoreFriendRequest = async (req, res) => {
  try {
    const user = req.user;
    const { friendId } = req.body;

    // check if user exists
    const userQuery = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [friendId]
    );
    if (userQuery.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // figure out how to do this
    await pool.query(
      `DELETE FROM friend_requests WHERE (to_id = $1 AND from_id = $2) OR (to_id = $2 AND from_id = $1)`,
      [user.id, friendId]
    );

    return res.status(200).json({ message: "Ignored friend request" });
  } catch (error) {
    console.log(error)
    return res.status(500).send(error.message);
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = req.user;

    const friendsQuery = await pool.query(
      "SELECT friend_id FROM friends WHERE user_id = $1",
      [user.id]
    );

    const friendUsers = await Promise.all(
      friendsQuery.rows.map(async (row) => {
        const userQuery = await pool.query(
          "SELECT * FROM users WHERE users.id = $1",
          [row["friend_id"]]
        );
        if (userQuery.rowCount !== 0) {
          return createUserFromQueryResult(userQuery.rows[0]);
        }
      })
    );



    return res.status(200).json(friendUsers);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

function createUserFromQueryResult(row) {
  return {
    id: row["id"],
    email: row["email"],
    username: row["username"],
    displayName: row["display_name"],
    password: row["password"],
    birthdate: row["birthdate"],
  };
}

async function addFriendById(userId, friendId) {
  await pool.query(
    "INSERT INTO friends (user_id, friend_id) VALUES ($1, $2);",
    [userId, friendId]
  );

  // remove entry from friend_requests where from or to = friendId
  await pool.query(
    `UPDATE friend_requests
      SET status = 1
      WHERE to_id IN (
      SELECT users.id 
      FROM users INNER JOIN friends ON users.id = friends.user_id
      WHERE friends.user_id = $1 AND friends.friend_id = $2);`,
    [userId, friendId]
  );
}
