import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { HTTPStatusCode } from "./enum";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET || "";

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(HTTPStatusCode.UNAUTHORIZED)
      .json({ message: "Access token is missing" });
  }

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      return res
        .status(HTTPStatusCode.FORBIDDEN)
        .json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

export const authenticateAPIKeyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const secretKey = req.headers["secret-key"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(HTTPStatusCode.UNAUTHORIZED)
      .json({ message: "Access token is missing" });
  }

  jwt.verify(token, secretKey, (err: any, user: any) => {
    if (err) {
      console.log(err);      
      return res
        .status(HTTPStatusCode.FORBIDDEN)
        .json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};
