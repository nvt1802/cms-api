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
        .select("username,email,profile_picture,role,first_name,last_name")
        .eq("id", userId);
      if (data && !!data?.length) {
        res.json(responseAPI(data[0], HTTPStatusCode.OK));
      } else {
        res
          .status(HTTPStatusCode.CREATED)
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
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  try {
    const { data, count } = await supabase
      .from("users")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    if (data && !!data?.length) {
      const totalPages = Math.ceil((count || 0) / limit);
      res.status(HTTPStatusCode.OK).json(
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
