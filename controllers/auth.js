import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import pool from "../database.js";

export const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // check if user already exists
    let userExists;
    pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
      (err, res) => {
        if (err) {
          console.log(err);
          res.status(500).send(err.message);
        } else {
          userExists = res.rowCount > 0;
        }
      }
    );
    if (userExists) {
      return res.status(409).send("User already exists");
    }

    // insert new user
    pool.query(
      `INSERT INTO users(id, username, password) values ($1, $2, $3) RETURNING *`,
      [uuidv4(), username, passwordHash],
      (err, res) => {
        if (err) {
          console.log(err);
          res.status(500).send(err.message);
        } else {
          res
            .status(201)
            .send("User inserted successfully")
            .json({ user: res.rows[0] });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user;
    pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username],
      (err, res) => {
        if (err) {
          console.log(err);
          res.status(500).send(err.message);
        } else {
          user = res.rows[0];
        }
      }
    );
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials.");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
