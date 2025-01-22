import { neon } from "@neondatabase/serverless";
import { bcrypt } from "bcryptjs";
import { jwt } from "jsonwebtoken";
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

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json("Error");
  }
};
