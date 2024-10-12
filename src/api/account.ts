import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { responseAPI } from "../utils/apiResponse";
import { HTTPStatusCode } from "../utils/enum";
import { authenticateToken } from "../utils/authenticateToken";

const router = express.Router();

router.get(
  "/userinfo/:userId",
  authenticateToken,
  async (req: Request, res: Response) => {
    const userId = req.params?.userId;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username,email,profile_picture,role")
        .eq("id", userId);
      if (data && !!data?.length) {
        res.json(responseAPI(data[0], HTTPStatusCode.OK));
      } else {
        res
          .status(HTTPStatusCode.UNAUTHORIZED)
          .json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.get("/users", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from("users")
      .select("username,email,profile_picture,role,created_at,updated_at");
    if (data && !!data?.length) {
      res.json(responseAPI(data, HTTPStatusCode.OK));
    } else {
      res
        .status(HTTPStatusCode.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(HTTPStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Error" });
  }
});

export default router;
