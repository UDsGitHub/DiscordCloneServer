import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import pool from "../database.js";

export const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // check if user already exists
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rowCount > 0) {
      return res.status(409).send("User already exists");
    }

    // insert new user
    const newUser = await pool.query(
      `INSERT INTO users(id, username, password) values ($1, $2, $3) RETURNING *`,
      [uuidv4(), username, passwordHash]
    );
    res
      .status(201)
      .send("User inserted successfully")
      .json({ user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(`SELECT * FROM users WHERE username = $1`, [
      username,
    ]);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials.");
    res.status(200).json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
