import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUserAuth } from "../types/type";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET || "";

const generateToken = (user: IUserAuth) => {
  return jwt.sign({ username: user.username, email: user.email }, jwtSecret, {
    expiresIn: "1d",
  });
};

export default generateToken;
