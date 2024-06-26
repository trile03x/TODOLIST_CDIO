const express = require("express");
const {Tasks} = require("../models/index");
const {checkEmty}= require("../middleware/validations/check");
const {createTasks,showTasks,showDetailTasks,updateTasks,deleteTasks,showDetailTaskByQuery,showRunorDone} = require("../controllers/task_controller")
const taskRouter = express.Router();
taskRouter.post("/filter", showDetailTaskByQuery);
taskRouter.post("/create", createTasks);
taskRouter.get("/show", showTasks);
taskRouter.get("/RunOrDone", showRunorDone);
taskRouter.get("/:id", checkEmty(Tasks), showDetailTasks);
taskRouter.put("/:id", checkEmty(Tasks), updateTasks);
taskRouter.delete("/:id", checkEmty(Tasks), deleteTasks);
module.exports = {
  taskRouter,
};