import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { responseAPI } from "../utils/apiResponse";
import { authenticateAPIKeyToken } from "../utils/authenticateToken";
import { HTTPStatusCode } from "../utils/enum";
import { convertEditorDataToHTML } from "../utils/richText";

const router = express.Router();

router.get(
  "/external/posts",
  authenticateAPIKeyToken,
  async (req: Request, res: Response) => {
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
        .eq("status", "published")
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
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.get(
  "/external/posts/:slug",
  authenticateAPIKeyToken,
  async (req: Request, res: Response) => {
    try {
      const { data } = await supabase
        .from("posts")
        .select(
          "*, categories(id, name,slug), users(id, username, profile_picture), tags(id, name,slug)"
        )
        .eq("slug", req.params?.slug)
        .eq("status", "published")
        .single();

      if (data) {
        const content = convertEditorDataToHTML(
          data?.content ? JSON?.parse(data?.content)?.blocks : ""
        );

        res
          .status(HTTPStatusCode.OK)
          .json(responseAPI({ ...data, content }, HTTPStatusCode.OK));
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

export default router;
