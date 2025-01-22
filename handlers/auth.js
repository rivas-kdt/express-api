import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config.js";

const url =
  "postgres://neondb_owner:qTW3gjS8ltVk@ep-wild-queen-a1lj8262-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(process.env.DATABASE_URL || url);

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
      secure: process.env.NODE_ENV === "production", // Set cookie to be sent only over HTTPS in production
      sameSite: "Strict",
    });
    res.status(200).json("Success!");
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
    res.cookie("jwt", { maxAge: 0 });
    res.status(200).json("Logged out successfully!");
  } catch (error) {
    res.status(500).json("Error");
  }
};
