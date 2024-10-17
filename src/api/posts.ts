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
        "*, categories(id, name,slug), users(id, username, profile_picture), tags(id, name,slug)",
        {
          count: "exact",
        }
      )
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

router.get(
  "/posts/:slug",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, categories(id, name,slug), users(id, username, profile_picture), tags(id, name,slug)"
        )
        .like("slug", req.params?.slug);
      if (!!data?.length) {
        res
          .status(HTTPStatusCode.OK)
          .json(responseAPI(data[0], HTTPStatusCode.OK));
      } else {
        res.status(HTTPStatusCode.NOT_FOUND).json({ message: "Not found" });
      }
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.post(
  "/posts",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("slug")
        .like("slug", req.body?.slug);
      if (!!data?.length) {
        res
          .status(HTTPStatusCode.CONFLICT)
          .json(
            responseAPI({ message: "slug is used" }, HTTPStatusCode.CONFLICT)
          );
      } else {
        const { data: _ } = await supabase.from("posts").insert([req.body]);
        res
          .status(HTTPStatusCode.CREATED)
          .json(responseAPI(data, HTTPStatusCode.CREATED));
      }
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.put(
  "/posts/:slug",
  authenticateToken,
  async (req: Request, res: Response) => {   
    try {
      const { data, error } = await supabase
        .from("posts")
        .update(req.body)
        .eq("slug", req.params?.slug);
      res.status(HTTPStatusCode.OK).json(responseAPI(data, HTTPStatusCode.OK));
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

export default router;
