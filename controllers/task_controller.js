const { where, Op } = require("sequelize");
let idUser;
const { Tasks, taskUser, user } = require("../models/index");
const createTasks = async (req, res) => {
  const { taskTitle, taskLevel, taskType, endDay, startDay, descTask, status, email } = req.body;
  try {
    const newTask = await Tasks.create({ taskTitle, taskLevel, taskType, endDay, startDay, descTask, status });
    const task_id = newTask.id;
    const checkUser = await user.findOne({
      where: {
        email
      }
    })
    if (!checkUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user_id = checkUser.id;
    const newTaskUser = await taskUser.create({ user_id, task_id });
    return res.status(200).send(newTaskUser)
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const showTasks = async (req, res) => {
  const { email } = req.query;
  const taskIds = await checkIdTask(email);
  let whereClause = {
    id: {
      [Op.in]: taskIds
    }
  }
  try {
    const taskList = await Tasks.findAll({
      where: whereClause,
    });
    res.send(taskList);
  } catch (error) {
    res.send(error);
  }
};
const showRunorDone = async (req, res) => {
  let { statusTask, email, taskTitle } = req.query;
  statusTask = (statusTask === 'true');
  const taskIds = await checkIdTask(email);
  let whereClause = {
    id: {
      [Op.in]: taskIds
    },
    status: statusTask
  }
  console.log(taskTitle);
  try {
    if (taskTitle) {
      whereClause.taskTitle = {
        [Op.like]: `%${taskTitle}%`
      };
      const taskList = await Tasks.findAll({
        where: whereClause,
      });
      res.send(taskList);
    } else {
      const taskList = await Tasks.findAll({
        where: whereClause,
      });
      res.send(taskList);
    }

  } catch (error) {
    res.send(error);
  }

}
const showDetailTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Tasks.findOne({
      where: {
        id,
      },
    });
    res.send(task);
  } catch (error) {
    res.send(error);
  }
};
const checkIdTask = async (email) => {
  const userCheck = await user.findOne({
    where: {
      email
    }
  })
  idUser = userCheck.id;
  const listTaskId = await taskUser.findAll({
    where: {
      user_id: idUser
    },
    attributes: ['task_id']
  })
  // Lấy danh sách các task_id từ listTaskId
  const taskIds = listTaskId.map(record => record.task_id);
  return taskIds;
};
const showDetailTaskByQuery = async (req, res) => {
  try {
    const { taskLevel, taskType, status, email } = req.body;
    const taskIds = await checkIdTask(email);
    // console.log(taskLevel, taskType,status,email);
    // Xây dựng điều kiện tìm kiếm cho các thuộc tính
    let whereClause = {
      id: {
        [Op.in]: taskIds
      }
    };
    if (taskLevel == -1 && taskType == -1 && status == -1) {
      let tasks = await Tasks.findAll({
        where: whereClause
      });
      res.status(200).send(tasks);
    } else if (taskLevel != -1 && taskType != -1 && status != -1) {
      whereClause.taskLevel = taskLevel;
      whereClause.status = status;
      whereClause.taskType = taskType;
      let tasks = await Tasks.findAll({
        where: whereClause
      }
      );
      res.status(200).send(tasks);
    }
    else {
      res.status(404).send("Input data is not enough")
    }

  }
  catch (error) {
    res.status(404).send(error);
  }
};
const updateTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await Tasks.update(data, {
      where: {
        id,
      },
    });
    res.status(200).send("Update");
  } catch (error) {
    res.send(error);
  }
};
const deleteTasks = async (req, res) => {
  try {
    const { id } = req.params;
    await Promise.all([
      Tasks.destroy({
        where: {
          id,
        }
      }),
      taskUser.destroy({
        where: {
          task_id: id,
        }
      })
    ])
      .then(() => {
        res.status(200).send("Removed");
      })
  } catch (error) {
    res.status(404).send(error);
  }
};
module.exports = {
  createTasks,
  showTasks,
  showDetailTasks,
  updateTasks,
  deleteTasks,
  showRunorDone,
  showDetailTaskByQuery,
};
