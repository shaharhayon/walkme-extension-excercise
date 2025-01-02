import express from "express";
import router from "./router";

const app = express();
const port = 3000;

app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


/*
 * GET /tasks - returns the list of tasks 
 * POST	/task - adds a new task 
 * PUT /task - update a task
 * DELETE /task - removes a task
*/