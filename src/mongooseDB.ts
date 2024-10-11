import mongoose from "mongoose";
import { ITask } from "./type";

const uri = "mongodb+srv://tainguyen:Vantai6600@cluster0.eim6r.mongodb.net/";
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));

const tasksSchema = new mongoose.Schema({
  name: String,
  created: String,
  dateEnd: String,
});

const TasksModel = mongoose.model("tasks", tasksSchema);

export const getAllTasks = async () => {
  try {
    const result = await TasksModel.find();
    return result?.map((item) => ({
      id: item?.id,
      name: item?.name,
      created: item?.created,
      dateEnd: item?.dateEnd,
    }));
  } catch (error) {
    return [];
  }
};

export const createTask = async (value: { name?: string }) => {
  try {
    const newTask = new TasksModel({
      name: value?.name,
      created: new Date().toUTCString(),
      dateEnd: null,
    });
    await newTask.save();
  } catch (error) {
    console.error("Error creating task:", error);
  } finally {
    mongoose.connection.close();
  }
};

export const updateTask = async (_id: string, task: ITask) => {
  try {
    await TasksModel.updateOne({ _id }, { $set: { name: task?.name, dateEnd: task?.dateEnd } });
  } catch (error) {
    console.error("Error creating task:", error);
  } finally {
    mongoose.connection.close();
  }
};

export const deleteTask = async (_id: string) => {
  try {
    await TasksModel.deleteOne({ _id });
  } catch (error) {
    console.error("Error creating task:", error);
  } finally {
    mongoose.connection.close();
  }
};
