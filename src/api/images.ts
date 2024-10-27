import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { responseAPI } from "../utils/apiResponse";
import { HTTPStatusCode } from "../utils/enum";
import { authenticateToken } from "../utils/authenticateToken";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

router.get(
  "/images",
  authenticateToken,
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    try {
      const { data, count } = await supabase
        .from("images")
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
  "/images",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data: post } = await supabase
        .from("images")
        .insert([req.body])
        .select("*")
        .single();
      res
        .status(HTTPStatusCode.CREATED)
        .json(responseAPI(post, HTTPStatusCode.CREATED));
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.delete(
  "/images/:imageId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data: image } = await supabase
        .from("images")
        .select("*")
        .eq("id", req.params?.imageId)
        .single();
      if (image) {
        const result = await cloudinary.uploader.destroy(image?.public_id);
        if (result) {
          const { data, error } = await supabase
            .from("images")
            .delete()
            .eq("id", req.params?.imageId);
          if (error) {
            res
              .status(HTTPStatusCode.CONFLICT)
              .json(
                responseAPI(
                  { message: "Cannot delete images" },
                  HTTPStatusCode.CONFLICT
                )
              );
          } else {
            res
              .status(HTTPStatusCode.OK)
              .json(
                responseAPI(
                  { message: "Delete images success" },
                  HTTPStatusCode.OK
                )
              );
          }
        }
      } else {
        res
          .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: "Error" });
      }
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

export default router;
