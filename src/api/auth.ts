import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { hashPassword, verifyPassword } from "../utils/password";
import generateToken from "../utils/token";
import { HTTPStatusCode } from "../utils/enum";
import { IUserAuth } from "../types/type";
import { responseAPI } from "../utils/apiResponse";

const router = express.Router();

const checkUserExists = async (username: string, email: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`username.eq.${username},email.eq.${email}`);

  if (error) {
    console.error("Error checking user:", error);
    return { usernameExists: false, emailExists: false };
  }

  const usernameExists = data.some(
    (user: IUserAuth) => user.username === username
  );
  const emailExists = data.some((user: IUserAuth) => user.email === email);

  return { usernameExists, emailExists };
};

router.post("/login", async (req: Request, res: Response) => {
  const { username, password }: { username: string; password: string } =
    req.body;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id,username,email,password")
      .or(`username.eq.${username},email.eq.${username}`);
    const userExists = data?.find(
      (user) => user.username === username || user.email === username
    );
    if (userExists && !!data?.length) {
      const passwordIsCorrect = await verifyPassword(
        password,
        data[0]?.password || ""
      );
      if (passwordIsCorrect) {
        const token = generateToken(userExists);
        res.json(
          responseAPI({ token, userId: userExists?.id }, HTTPStatusCode.OK)
        );
      }
    } else {
      res
        .status(HTTPStatusCode.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res
      .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Error login user" });
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  const { username, password, email, role } = req.body;
  try {
    const { emailExists, usernameExists } = await checkUserExists(
      username,
      email
    );
    if (!emailExists && !usernameExists) {
      const hashedPassword = await hashPassword(password);
      const newUser = { username, password: hashedPassword, email, role };
      const { data: _ } = await supabase.from("users").insert([newUser]);
      res.json(
        responseAPI(
          { message: "User registered successfully!" },
          HTTPStatusCode.CREATED
        )
      );
    } else {
      res
        .status(HTTPStatusCode.CONFLICT)
        .json({ message: "username or email already taken" });
    }
  } catch (error) {
    res
      .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Error registering user" });
  }
});

export default router;
