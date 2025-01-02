
import express from 'express';

const router = express.Router();

const loggingMiddleware: express.RequestHandler = (req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};

router.use(loggingMiddleware);

router.get('/tasks', (_req, res) => {
    res.send('GET /tasks');
});

router.post('/task', (_req, res) => {
    res.send('POST /task');
});

router.put('/task', (_req, res) => {
    res.send('PUT /task');
});

router.delete('/task', (_req, res) => {
    res.send('DELETE /task');
});

export default router;

/*
 * GET /tasks - returns the list of tasks 
 * POST	/task - adds a new task 
 * PUT /task - update a task
 * DELETE /task - removes a task
*/