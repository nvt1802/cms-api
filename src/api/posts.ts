import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { authenticateToken } from "../utils/authenticateToken";
import { HTTPStatusCode } from "../utils/enum";

const router = express.Router();

router.get("/posts", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { data } = await supabase.from("posts").select("*");
    res.status(HTTPStatusCode.OK).json(data);
  } catch (error) {
    console.log(error);
    res.status(HTTPStatusCode.INTERNAL_SERVER_ERROR).json({ error });
  }
});

export default router;
