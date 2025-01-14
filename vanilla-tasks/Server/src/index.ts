import express from "express";
import router from "./router";
// import { DB } from "./database";

const app = express();
const port = 3000;

app.use(router);
// app.use(express.json())

// const db = new DB();
// db.AddTask({text: 'test1', status: false})
// db.getAllTasks();
// db.getTask(2);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


/*
 * GET /tasks - returns the list of tasks 
 * POST	/task - adds a new task 
 * PUT /task - update a task
 * DELETE /task - removes a task
*/