import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./api/auth";
import postsRoutes from "./api/posts";
import accountRoutes from "./api/account";
import categoriesRoutes from "./api/categories";
import tagsRoutes from "./api/tags";
import uploadRoutes from "./api/upload";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 4000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", async (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/api/", authRoutes);
app.use("/api/", postsRoutes);
app.use("/api/", accountRoutes);
app.use("/api/", categoriesRoutes);
app.use("/api/", tagsRoutes);
app.use("/api/", uploadRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at port: ${port}`);
});
