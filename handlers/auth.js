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
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ id: users.id }, process.env.JWT_SECRET);
    res.status(200).json(token);
  } catch (error) {}
};
