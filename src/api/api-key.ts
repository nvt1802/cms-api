import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { responseAPI } from "../utils/apiResponse";
import { HTTPStatusCode } from "../utils/enum";
import { authenticateToken } from "../utils/authenticateToken";
import { generateAPIKey } from "../utils/token";

const router = express.Router();

router.get(
  "/api-keys",
  authenticateToken,
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    try {
      const { data, count } = await supabase
        .from("api_keys")
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
  "/api-keys",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const token = generateAPIKey(
        req.body?.name,
        req.body?.secret_key,
        req.body?.expiry_date || "10y"
      );
      const { data: apiKey } = await supabase
        .from("api_keys")
        .insert([
          {
            ...req.body,
            token,
          },
        ])
        .select("*")
        .single();
      res
        .status(HTTPStatusCode.CREATED)
        .json(responseAPI(apiKey, HTTPStatusCode.CREATED));
    } catch (error) {
      console.log(error);
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

router.delete(
  "/api-keys/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", req.params?.id);
      if (error) {
        res
          .status(HTTPStatusCode.CONFLICT)
          .json(
            responseAPI(
              { message: "Cannot delete token" },
              HTTPStatusCode.CONFLICT
            )
          );
      } else {
        res
          .status(HTTPStatusCode.CREATED)
          .json(
            responseAPI(
              { message: "Delete token success" },
              HTTPStatusCode.CREATED
            )
          );
      }
    } catch (error) {
      res
        .status(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
  }
);

export default router;
