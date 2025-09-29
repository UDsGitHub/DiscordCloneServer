import pool from "../../../lib/database/index.js";
import { AppUser } from "../../businessObject/AppUser.js";
import { DefaultQueryObjectResult } from "../../usecase/index.js";
import { IUserService } from "../implementation/IUserService.js";

export class UserService implements IUserService {
  constructor() {}

  createUserFromQueryResult(row: DefaultQueryObjectResult): AppUser {
    return new AppUser(
      row.id,
      row.email,
      row.display_name,
      row.username,
      row.birthdate
    );
  }

  async getDmUsers(userId: string): Promise<DefaultQueryObjectResult[]> {
    const queryResult = await pool.query(
      `SELECT (SELECT display_name FROM users where id = m.to_id) as display_name, m.* FROM messages m INNER JOIN users u ON m.from_id = u.id WHERE u.id = $1 ORDER BY m.time_stamp`,
      [userId]
    );
    return queryResult.rows ?? [];
  }

  async addFriendById(userId: string, friendId: string): Promise<void> {
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

  async insertMessage(
    fromId: string,
    toId: string,
    content: string
  ): Promise<void> {
    await pool.query(
      `INSERT INTO messages (from_id, to_id, message_content)
      VALUES ($1, $2, $3);`,
      [fromId, toId, content]
    );
  }

  async getUserByUsername(
    username: string
  ): Promise<DefaultQueryObjectResult | undefined> {
    const queryResult = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    return queryResult.rows[0];
  }

  async getUserByEmail(
    email: string
  ): Promise<DefaultQueryObjectResult | undefined> {
    const queryResult = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    return queryResult.rows[0];
  }

  async getUserById(id: string): Promise<DefaultQueryObjectResult | undefined> {
    const queryResult = await pool.query(
      `SELECT * FROM users WHERE users.id = $1`,
      [id]
    );

    return queryResult.rows[0];
  }

  async areWeFriends(userId: string, friendId: string): Promise<boolean> {
    const queryResult = await pool.query(
      `SELECT * 
      FROM bidirectional_friends bf
      JOIN users u1 ON bf.user_id = u1.id
      JOIN users u2 ON bf.friend_id = u2.id
      WHERE (u1.username = $1 AND u2.username = $2)
      OR (u1.username = $2 AND u2.username = $1);
    `,
      [userId, friendId]
    );
    return queryResult.rowCount > 0;
  }

  async outGoingFriendRequestExists(
    fromId: string,
    toId: string
  ): Promise<boolean> {
    const queryResult = await pool.query(
      `SELECT * FROM friend_requests WHERE from_id = $1 and to_id = $2 AND status != 1`,
      [fromId, toId]
    );

    return queryResult.rowCount > 0;
  }

  async incomingFriendRequestExists(
    toId: string,
    fromId: string
  ): Promise<boolean> {
    const queryResult = await pool.query(
      `SELECT * FROM friend_requests WHERE to_id = $1 AND from_id = $2 AND status = 0`,
      [toId, fromId]
    );

    return queryResult.rowCount > 0;
  }

  async addFriendRequest(fromId: string, toId: string): Promise<void> {
    await pool.query(
      "INSERT INTO friend_requests (from_id, to_id) VALUES ($1, $2);",
      [fromId, toId]
    );
  }

  async getFriendRequests(userId: string): Promise<DefaultQueryObjectResult[]> {
    const queryResult = await pool.query(
      `SELECT 
      CASE WHEN from_id = $1 THEN to_id ELSE from_id END AS sender_id,
      CASE WHEN from_id = $1 THEN 0 ELSE 1 END AS direction, 
      status 
      FROM friend_requests
      WHERE (to_id = $1 OR from_id = $1) AND status = 0 ORDER BY created_at DESC;`,
      [userId]
    );

    return queryResult.rows ?? [];
  }

  async deleteFriend(userId: string, friendId: string): Promise<void> {
    await pool.query("DELETE friends WHERE user_id = $1 AND friend_id = $2;", [
      userId,
      friendId,
    ]);
  }

  async deleteFriendRequest(userId: string, friendId: string): Promise<void> {
    await pool.query(
      `DELETE FROM friend_requests WHERE (to_id = $1 AND from_id = $2) OR (to_id = $2 AND from_id = $1)`,
      [userId, friendId]
    );
  }

  async getFriendUsers(userId: string): Promise<AppUser[]> {
    const friendsQuery = await pool.query(
      "SELECT friend_id FROM friends WHERE user_id = $1",
      [userId]
    );

    const friendUsers = [];
    for (const row of friendsQuery.rows) {
      const friendUser = await this.getUserById(row.id);
      if (friendUser) {
        friendUsers.push(this.createUserFromQueryResult(friendUser));
      }
    }

    return friendUsers;
  }

  async createUser(request: {
    id: string;
    email: string;
    displayName: string;
    username: string;
    password: string;
    birthdate: string;
  }): Promise<AppUser> {
    const { id, ...rest } = request;
    await pool.query(
      `INSERT INTO users(id, email, display_name, username, password, birthdate) values ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [Object.values(request)]
    );

    return this.createUserFromQueryResult(this.getUserById(id));
  }
}
