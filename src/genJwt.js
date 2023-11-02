import "dotenv/config";
import jwt from "jsonwebtoken";

const payload = {
  id: 1,
};

const JwtSecret = process.env.JWT_SECRET || "";

const token = jwt.sign(payload, JwtSecret, {
  expiresIn: "7d",
});

console.log(token);
