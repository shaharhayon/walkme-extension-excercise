
import express from 'express';
import { DB } from './database';

const db = new DB();

db.getTask(2);

const router = express.Router();
router.use(express.json());

const loggingMiddleware: express.RequestHandler = (req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} body: ${JSON.stringify(req.body)}`);
    next();
};

router.use(loggingMiddleware);

router.get('/tasks', (_req, res) => {
    try {
        const tasks = db.getAllTasks();
        res.send(JSON.stringify(tasks));
    } catch (e) {
        res.status(500).send(JSON.stringify(e));
    }
});

router.post('/task', (req, res) => {
    const updatedTask = req.body
    if (updatedTask['text'] == undefined) {
        res.status(400).send(JSON.stringify(new Error('post must contain text')));
        return;
    }
    try {
        const addedTask = db.AddTask(updatedTask);
        res.status(200).send(JSON.stringify(addedTask));
    } catch (e) {
        res.status(500).send(JSON.stringify(e));
    }
});

router.put('/task', (req, res) => {
    const id = req.body['id']
    const text = req.body['text'];
    const status = req.body['status']
    console.log(JSON.stringify(req.body));
    console.log(typeof id)
    if (!(typeof id == 'number')){
        console.log(1)
        res.status(400).send(JSON.stringify(new Error('put must contain id')));
        return;
    } else if (!(typeof text == 'string' || (status === 0 || status === 1))){
        console.log(2)
        res.status(400).send(JSON.stringify(new Error('put must contain text or status')));
        return;
    }
    try {
        let updatedTask: ReturnType<DB['UpdateTask']>;
        if (text !== undefined){
            updatedTask = db.UpdateTask(id, text);
        } else if (status !== undefined) {
            updatedTask = db.CompleteTask(id);
        }
        res.status(200).send(JSON.stringify(updatedTask!));
    } catch (e) {
        res.status(500).send(JSON.stringify(e));
    }
});

router.delete('/task', (req, res) => {
    const id = req.body['id']
    if (!(typeof id == 'number')) {
        res.status(400).send(JSON.stringify(new Error('delete must contain id')));
        return;
    }
    try {
        const deletedTask = db.RemoveTask(id);
        res.status(200).send(JSON.stringify(deletedTask));
    } catch (e) {
        res.status(500).send(JSON.stringify(e));
    }
});

export default router;

/*
 * GET /tasks - returns the list of tasks 
 * POST	/task - adds a new task 
 * PUT /task - update a task
 * DELETE /task - removes a task
*/