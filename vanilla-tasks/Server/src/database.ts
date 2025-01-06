import { DatabaseSync } from 'node:sqlite'

type InternalTask = {
    id: number,
    text: string,
    status: 0 | 1
}

type PartialTask = {
    text: string,
    status?: boolean
}

type Task = {
    id: number,
    status: boolean
} & PartialTask

export class DB {
    // private readonly _db = new DatabaseSync(':memory:')
    private readonly _db: DatabaseSync;
    constructor(){
        console.log(`Using db at ${__dirname}/../tasks.db`)
        this._db = new DatabaseSync(`${__dirname}/../tasks.db`);
        this._db.exec(`
            CREATE TABLE IF NOT EXISTS tasks(
              id INTEGER PRIMARY KEY,
              text TEXT,
              status INTEGER
            ) STRICT
          `);
    }

    public getTask(id: number) {
        return this._getTask(id);
    }

    public getAllTasks(){
        return this._getAllTasks();
    }

    public AddTask(task: Task){
        return this._addTask(task);
    }

    public UpdateTask(id: number, text: Task['text']){
        return this._updateTask(id, text);
    }

    public RemoveTask(id: number){
        return this._removeTask(id);
    }

    public CompleteTask(id: number){
        return this._completeTask(id);
    }

    private _getTask(id: number): Task {
        const tasks: InternalTask[] = this._db.prepare(`
            SELECT *
            FROM tasks
            WHERE id = ${id}
        `).all() as InternalTask[];
        console.log(JSON.stringify(tasks));
        if (tasks.length > 1) throw new Error('_getTask returned multiple objects');
        return this._transform(tasks[0]);
    }

    private _getAllTasks(): Task[]{
        const tasks: InternalTask[] = this._db.prepare(`
            SELECT *
            FROM tasks
            WHERE status = 0
        `).all() as InternalTask[];
        return tasks.map(t => this._transform(t));
    }

    private _transform(task: InternalTask): Task{
        return {
            id: task.id,
            text: task.text,
            status: task.status === 1 ? true : false
        }
    }

    private _addTask(task: Task){
        return this._transform(this._db.prepare(`
            INSERT INTO tasks (text, status)
            VALUES('${task.text}', ${task.status === true ? 'TRUE' : 'FALSE'})
            RETURNING *;
        `).get() as InternalTask);
    }

    private _updateTask(id: number, text: Task['text']) {
        return this._transform(this._db.prepare(`
            UPDATE tasks
            SET text = '${text}'
            WHERE id = ${id}
            RETURNING *;
        `).get() as InternalTask);
    }

    private _removeTask(id: number) {
        return this._transform(this._db.prepare(`
            DELETE FROM tasks
            WHERE id = ${id}
            RETURNING *;
        `).get() as InternalTask);
    }

    private _completeTask(id: number) {
        return this._transform(this._db.prepare(`
            UPDATE tasks
            SET status = TRUE
            WHERE id = ${id}
            RETURNING *;
        `).get() as InternalTask);
    }
}
