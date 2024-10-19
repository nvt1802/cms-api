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
      const { data } = await supabase
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
        const { data: post } = await supabase
          .from("posts")
          .insert([req.body])
          .select("*")
          .single();
        res
          .status(HTTPStatusCode.CREATED)
          .json(responseAPI(post, HTTPStatusCode.CREATED));
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
      const { error } = await supabase
        .from("posts")
        .update(req.body)
        .eq("slug", req.params?.slug);
      if (error) {
        res
          .status(HTTPStatusCode.CONFLICT)
          .json(
            responseAPI({ message: error.message }, HTTPStatusCode.CONFLICT)
          );
      } else {
        const { data } = await supabase
          .from("posts")
          .select(
            "*, categories(id, name,slug), users(id, username, profile_picture), tags(id, name,slug)"
          )
          .eq("slug", req.body?.slug)
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

router.put(
  "/posts/tags/:slug",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data: post } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", req.params?.slug)
        .single();

      const {} = await supabase
        .from("post_tags")
        .delete()
        .eq("post_id", post?.id);

      const tagIds: string[] = req.body?.tags_id ?? [];

      const postTags = tagIds.map((tagId) => ({
        post_id: post?.id,
        tag_id: tagId,
      }));

      const { error: postTagError } = await supabase
        .from("post_tags")
        .insert(postTags);

      res.status(HTTPStatusCode.OK).json(responseAPI(post, HTTPStatusCode.OK));
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.post(
  "/posts/publish",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data: post } = await supabase
        .from("posts")
        .select("*")
        .eq("id", req.body?.id)
        .single();
      const { error } = await supabase
        .from("posts")
        .update({
          ...post,
          status: req.body?.status,
        })
        .eq("id", req.body?.id);
      if (error) {
        res
          .status(HTTPStatusCode.CONFLICT)
          .json(
            responseAPI({ message: error.message }, HTTPStatusCode.CONFLICT)
          );
      } else {
        const { data } = await supabase
          .from("posts")
          .select(
            "*, categories(id, name,slug), users(id, username, profile_picture), tags(id, name,slug)"
          )
          .eq("id", req.body?.id)
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

router.get(
  "/posts/check-slug/:slug",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data } = await supabase
        .from("posts")
        .select("slug")
        .eq("slug", req.params?.slug)
        .single();

      res
        .status(HTTPStatusCode.OK)
        .json(responseAPI({ isUsed: data ? true : false }, HTTPStatusCode.OK));
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.post(
  "/posts/tags",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data: post } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", req.body?.slug)
        .single();
      console.log(post);

      const tagIds: string[] = req.body?.tags_id ?? [];
      const postTags = tagIds.map((tagId) => ({
        post_id: post?.id,
        tag_id: tagId,
      }));
      const { error: _postTagError } = await supabase
        .from("post_tags")
        .insert(postTags);
      res
        .status(HTTPStatusCode.OK)
        .json(responseAPI({ message: "Add tags success" }, HTTPStatusCode.OK));
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

export default router;
