import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { responseAPI } from "../utils/apiResponse";
import { HTTPStatusCode } from "../utils/enum";
import { authenticateToken } from "../utils/authenticateToken";

const router = express.Router();

router.get(
  "/categories",
  authenticateToken,
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    try {
      const { data, count } = await supabase
        .from("categories")
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
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.post(
  "/categories",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data } = await supabase
        .from("categories")
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
          .from("categories")
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
  "/categories/:categoryId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          ...req.body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params?.categoryId);
      if (error) {
        res
          .status(HTTPStatusCode.NOT_FOUND)
          .json(
            responseAPI({ message: error.message }, HTTPStatusCode.NOT_FOUND)
          );
      } else {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("id", req.params?.categoryId)
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
  "/categories/:categoryId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data } = await supabase
        .from("posts")
        .select("category_id")
        .eq("category_id", req.params?.categoryId)
        .single();

      if (data) {
        res
          .status(HTTPStatusCode.OK)
          .json(
            responseAPI(
              { message: "Cannot delete category currently in use" },
              HTTPStatusCode.OK
            )
          );
      } else {
        const { data, error } = await supabase
          .from("categories")
          .delete()
          .eq("id", req.params?.categoryId);
        if (error) {
          res
            .status(HTTPStatusCode.CONFLICT)
            .json(
              responseAPI(
                { message: "Cannot delete category" },
                HTTPStatusCode.CONFLICT
              )
            );
        } else {
          res
            .status(HTTPStatusCode.OK)
            .json(
              responseAPI(
                { message: "Delete category success" },
                HTTPStatusCode.OK
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
