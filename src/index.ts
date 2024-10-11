import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createTask, getAllTasks, updateTask, deleteTask } from "./mongooseDB";
import bodyParser from "body-parser";
import { ITask } from "./type";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", async (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/api/tasks", async (req: Request, res: Response) => {
  const result = await getAllTasks();
  res.json({
    data: "success",
    result,
  });
});

app.post("/api/tasks", async (req: Request, res: Response) => {
  const body = req?.body as ITask;
  createTask({ name: body.name });
  res.json({
    data: "success",
  });
});

app.put("/api/tasks/:id", async (req: Request, res: Response) => {
  const body = req?.body as ITask;
  await updateTask(req.params?.id, body);
  res.json({
    data: "success",
  });
});

app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
  await deleteTask(req.params?.id);
  res.json({
    data: "success",
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
