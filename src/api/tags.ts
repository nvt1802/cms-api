import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { responseAPI } from "../utils/apiResponse";
import { HTTPStatusCode } from "../utils/enum";
import { authenticateToken } from "../utils/authenticateToken";

const router = express.Router();

router.get("/tags", authenticateToken, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  try {
    const { data, count } = await supabase
      .from("tags")
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

router.post("/tags", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from("tags")
      .select("slug")
      .like("slug", req.body?.slug);
    if (!!data?.length) {
      res
        .status(HTTPStatusCode.CONFLICT)
        .json(
          responseAPI({ message: "slug is used" }, HTTPStatusCode.CONFLICT)
        );
    } else {
      const { data: post } = await supabase
        .from("tags")
        .insert([req.body])
        .select("*")
        .single();
      res
        .status(HTTPStatusCode.CREATED)
        .json(responseAPI(post, HTTPStatusCode.CREATED));
    }
  } catch (error) {
    res.status(HTTPStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Error" });
  }
});

router.put(
  "/tags/:tagId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { error } = await supabase
        .from("tags")
        .update({
          ...req.body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params?.tagId);
      if (error) {
        res
          .status(HTTPStatusCode.NOT_FOUND)
          .json(
            responseAPI({ message: error.message }, HTTPStatusCode.NOT_FOUND)
          );
      } else {
        const { data } = await supabase
          .from("tags")
          .select("*")
          .eq("id", req.params?.tagId)
          .single();
        res
          .status(HTTPStatusCode.OK)
          .json(responseAPI(data, HTTPStatusCode.OK));
      }
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.delete(
  "/tags/:tagId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data } = await supabase
        .from("post_tags")
        .select("*")
        .eq("tag_id", req.params?.tagId);

      if (!!data?.length) {
        res
          .status(HTTPStatusCode.OK)
          .json(
            responseAPI(
              { message: "Cannot delete tag currently in use" },
              HTTPStatusCode.OK
            )
          );
      } else {
        const { data, error } = await supabase
          .from("tags")
          .delete()
          .eq("id", req.params?.tagId);
        if (error) {
          res
            .status(HTTPStatusCode.CREATED)
            .json(
              responseAPI(
                { message: "Cannot delete tag" },
                HTTPStatusCode.CREATED
              )
            );
        } else {
          res
            .status(HTTPStatusCode.CREATED)
            .json(
              responseAPI(
                { message: "Delete tag success" },
                HTTPStatusCode.CREATED
              )
            );
        }
      }
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

export default router;
