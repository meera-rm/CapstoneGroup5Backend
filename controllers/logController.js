//controls the routes the way it goes for
const express = require('express');

//access to being able to things like get or set, update or delete
const logs = express.Router({ mergeParams: true });

const db = require('../db/dbConfig');

//import validation
const {
  getAllLogs,
  getALog,
  createLog,
  updateLog,
  deleteLog,
} = require('../queries/logs');



const commentController = require("./commentController");
logs.use("/:logId/comments", commentController);


//Index
logs.get('/', async (req, res) => {
  //console.log('get all /');

  const { studentId } = req.params;
  const allLogs = await getAllLogs(studentId);
  try {
    if (allLogs[0]) {
      res.status(200).json(allLogs);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(404).json({ sucess: false });
  }
});

// //Show
logs.get('/:logId', async (req, res) => {
  console.log('get one /:id');
  const { logId } = req.params;

  const log = await getALog(logId);

  if (log) {
    res.json(log);
  } else {
    res.status(404).json({ error: 'Log with given id not found' });
  }
});

// //CREATE
logs.post('/new', async (req, res) => {
  const newLog = req.body;
  console.log(newLog);
  try {
    const addLog = await createLog(newLog);
    res.status(200).json({
      success: true,
      payload: addLog[0],
    });
  } catch (error) {
    // console.log('Caught in error')
    res.status(404).json({ success: false, message: 'Log cannot be added' });
  }
});

// //update
logs.put('/:logId', async (req, res) => {
  console.log('Put /:logId');
  const { logId } = req.params;
  try {
    const updatedLog = await updateLog(req.body, logId);
    // console.log('inupdate query', updatedLog);
    res.status(200).json({ success: true, payload: updatedLog });
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, message: 'Log cannot be updated' });
  }
});

// //DELETE
logs.delete('/:logId', async (req, res) => {
  console.log('Delete /:logId', req.body, req.params);
  const { logId } = req.params;

  const deletedLog = await deleteLog(logId);

  if (deletedLog) {
    if (deletedLog.id) {
      res.status(200).json({
        success: true,
        payload: deletedLog,
      });
    } else {
      res.status(404).json({
        success: false,
        payload: 'not found',
      });
    }
  } else {
    res.status(500).json({
      success: false,
      payload: deletedLog,
    });
  }
});


module.exports = logs;
