import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config.js";

const sql = neon(process.env.DATABASE_URL);

exports.login = async (req, res) => {
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
    res.cookie("jwt", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    res.status(200).json("Success!");
  } catch (error) {
    res.status(500).json("Error");
  }
};

exports.user = async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, process.env.JWT_SECRET);
    if (!claims) {
      res.status(401).json("Unauthenticated");
    }
    const user = await sql`SELECT * FROM users WHERE id=${claims.id}`;
    const { password, ...data } = await user.toJson();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json("Error");
  }
};
