import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import accountRoutes from "./api/account";
import postsRoutes from "./api/posts";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 4000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", async (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/api/", accountRoutes);
app.use("/api/", postsRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at port: ${port}`);
});
