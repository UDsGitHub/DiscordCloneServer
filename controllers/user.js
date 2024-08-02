import pool from "../database.js";

export const getUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
        if (err) {
          // expired token and other sorts of token errors
          console.log(err);
          res.status(403).json(null);
        }
        pool.query("SELECT * from ClientInformation WHERE ID = ?", [user.id])
          .then((data) => res.status(200).json(data[0][0]));
      });
    } else {
      return res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getDmUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    // check if user exists
    const userQuery = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);
    if (userQuery.rowCount === 0) {
      return res.status(404).json({ message: "User not found", data: [] });
    }

    // insert new user
    const dmUsersQuery = await pool.query(
      `SELECT (SELECT username FROM users where id = m.toId) as username, m.* FROM messages m INNER JOIN users u ON m.fromId = u.id WHERE u.id = $1 ORDER BY m.time_stamp`,
      [userId]
    );

    const dmUsersResult = {};
    for (const user of dmUsersQuery.rows) {
      if (!dmUsersResult[user["toid"]]) {
        dmUsersResult[user["toid"]] = {
          userId: user["toid"],
          username: user["username"],
          currentMessage: '',
          messageList: [
            {
              id: user["id"],
              fromId: user["fromid"],
              toId: user["toid"],
              message: user["message"],
              timeStamp: new Date(user["time_stamp"]),
            },
          ],
        };
      } else {
        dmUsersResult[user["toid"]].messageList.push({
          id: user["id"],
          fromId: user["fromid"],
          toId: user["toid"],
          message: user["message"],
          timeStamp: new Date(user["time_stamp"]),
        });
      }
    }

    res.status(200).json(dmUsersResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
