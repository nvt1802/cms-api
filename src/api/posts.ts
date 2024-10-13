import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { authenticateToken } from "../utils/authenticateToken";
import { HTTPStatusCode } from "../utils/enum";
import { responseAPI } from "../utils/apiResponse";

const router = express.Router();

router.get("/posts", authenticateToken, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  try {
    const { data, count } = await supabase
      .from("posts")
      .select(
        "*, categories(name,slug), users(username, profile_picture), tags(name,slug)",
        {
          count: "exact",
        }
      )
      .range(offset, offset + limit - 1);

    if (data && !!data?.length) {
      const totalPages = Math.ceil((count || 0) / limit);
      res.json(
        responseAPI(
          {
            page,
            limit,
            totalPages,
            totalItem: count,
            items: data,
          },
          HTTPStatusCode.OK
        )
      );
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
