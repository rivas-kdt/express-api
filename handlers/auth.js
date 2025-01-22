import { neon } from "@neondatabase/serverless";
import { bcrypt } from "bcryptjs";
import { jwt } from "jsonwebtoken";
import "dotenv/config.js";

const sql = neon(process.env.DATABASE_URL);

exports.login = async (req, res) => {
  try {
    const users =
      await sql`SELECT * FROM users WHERE email = '${req.body.email}'`;

    if (users.length === 0) {
        res.status(404).json("Password does not match!");
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password_hash
    );

    if (!passwordMatch) {
        res.status(404).json("Password does not match!");
    }

    const token = jwt.sign({ id: users.id }, process.env.JWT_SECRET);
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json("Error");
  }
};
