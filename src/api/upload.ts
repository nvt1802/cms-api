import express, { Request, Response } from "express";
import { supabase } from "../database/supabase";
import { authenticateToken } from "../utils/authenticateToken";
import { HTTPStatusCode } from "../utils/enum";
import { responseAPI } from "../utils/apiResponse";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import CloudinaryStorage from "multer-storage-cloudinary";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @ts-ignore
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const timestamp = Date.now();
    const originalName = file.originalname.split(".")[0];
    const newName = `${originalName}-${timestamp}`;

    return {
      folder: "uploads",
      format: "png",
      public_id: newName,
    };
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  (req: Request, res: Response) => {
    try {
      if (req.file) {
        res.status(HTTPStatusCode.OK).json(
          responseAPI(
            {
              message: "File uploaded successfully",
              url: (req.file as Express.Multer.File).path,
              public_id: (req.file as Express.Multer.File).filename,
            },
            HTTPStatusCode.OK
          )
        );
      } else {
        res
          .status(HTTPStatusCode.NOT_FOUND)
          .json(
            responseAPI(
              { message: "Failed to upload file" },
              HTTPStatusCode.NOT_FOUND
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

router.post(
  "/upload-multiple",
  authenticateToken,
  upload.array("files", 10),
  (req: Request, res: Response) => {
    try {
      if (req.files && Array.isArray(req.files)) {
        const uploadedFiles = req.files.map((file) => ({
          url: (file as Express.Multer.File).path,
          public_id: (file as Express.Multer.File).filename,
        }));
        res
          .status(HTTPStatusCode.OK)
          .json(responseAPI(uploadedFiles, HTTPStatusCode.OK));
      } else {
        res
          .status(HTTPStatusCode.NOT_FOUND)
          .json(
            responseAPI(
              { message: "Failed to upload file" },
              HTTPStatusCode.NOT_FOUND
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
