//src/lib.session.js
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);

export const register = async (req, res) => {
  try {
    const { email, password, username, full_name } = req.body;

    if (!email || !password || !username || !full_name) {
      return res.status(400).json("All fields are required");
    }

    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await sql`
      INSERT INTO users (email, password_hash, username, full_name)
      VALUES (${email}, ${passwordHash}, ${username}, ${full_name})
      RETURNING id
    `;

    res.status(201).json("Success!");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json("Error");
  }
};

export const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      res.status(404).json("Password does not match!");
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(404).json("Password does not match!");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("jwt", token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });
    const { password_hash, ...data } = user;
    res.status(200).json(data || user);
  } catch (error) {
    res.status(500).json("Error");
  }
};

export const user = async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    if (!cookie) {
      return res.status(401).json("Unauthorized, No Cookie");
    }
    const claims = jwt.verify(cookie, process.env.JWT_SECRET);
    if (!claims) {
      res.status(401).json("Unauthenticated");
    }
    const user = await sql`SELECT * FROM users WHERE id=${claims.id}`;
    const { password_hash, ...data } = user[0];
    res.status(200).json(data || user);
  } catch (error) {
    res.status(401).json("Unauthenticated");
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set cookie to be sent only over HTTPS in production
      sameSite: "Lax",
    });
    res.status(200).json("Logged out successfully!");
  } catch (error) {
    res.status(500).json("Error");
  }
};
