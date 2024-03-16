import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import pool from "../database.js";

export const register = async (req, res) => {
  try {
    const { email, displayName, username, password, birthdate } = req.body;
    const salt = await bcrypt.genSalt();
    console.log(req.body);
    const passwordHash = await bcrypt.hash(password, salt);

    // check if user already exists
    const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userQuery.rowCount > 0) {
      return res.status(409).send("User already exists");
    }

    // insert new user
    const newUserQuery = await pool.query(
      `INSERT INTO users(id, email, display_name, username, password, birthdate) values ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uuidv4(), email, displayName, username, passwordHash, birthdate]
    );

    const responseData = {
      message: "User inserted successfully",
      user: newUserQuery.rows[0],
    };

    res.status(201).json(responseData);
    jwt.sign(user, process.env.JWT_SECRET);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const userQuery = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    if (userQuery.rows.length < 1) {
      return res.status(400).json({ message: "User not found." });
    }

    const user = userQuery.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).cookie("token", token).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
