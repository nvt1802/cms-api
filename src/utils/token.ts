import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUserAuth } from "../types/type";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET || "";

export const generateToken = (user: IUserAuth) => {
  return jwt.sign({ username: user.username, email: user.email }, jwtSecret, {
    expiresIn: "1d",
  });
};

export const generateAPIKey = (
  name: string,
  secret_key: string,
  expiry_date?: string
) => {
  return jwt.sign({ name, secret_key, expiry_date }, jwtSecret, {
    expiresIn: expiry_date ?? "10y",
  });
};
