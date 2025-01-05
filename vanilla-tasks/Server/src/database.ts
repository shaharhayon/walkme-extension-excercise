import { DatabaseSync } from 'node:sqlite'

type InternalTask = {
    id: number,
    text: string,
    status: 0 | 1
}

type Task = {
    text: string,
    status: boolean
}

export class DB {
    // private readonly _db = new DatabaseSync(':memory:')
    private readonly _db: DatabaseSync;
    constructor(){
        console.log(`creating db at ${__dirname}/../tasks.db`)
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

    private _getTask(id: number) {
        const tasks: InternalTask[] = this._db.prepare(`
            SELECT *
            FROM tasks
            WHERE id = ${id}
        `).all() as InternalTask[];
        console.log(JSON.stringify(tasks));
        if (tasks.length > 1) throw new Error('_getTask returned multiple objects');
        return tasks[0];
    }

    private _getAllTasks(){
        const tasks: InternalTask[] = this._db.prepare(`
            SELECT *
            FROM tasks
        `).all() as InternalTask[];
        console.log(JSON.stringify(tasks));
        return tasks;
    }

    private _transform(task: Required<Task>){

    }

    private _addTask(task: Task){
        this._db.exec(`
            INSERT INTO tasks (text, status)
            VALUES('${task.text}', ${task.status === true ? 'TRUE' : 'FALSE'})
        `);
    }

    private _updateTask(id: number, text: Task['text']) {
        this._db.exec(`
            UPDATE tasks
            SET text = '${text}'
            WHERE id = ${id}
        `);
    }

    private _removeTask(id: number) {
        this._db.exec(`
            DELETE FROM tasks
            WHERE id = ${id}
        `);
    }

    private _completeTask(id: number) {
        this._db.exec(`
            UPDATE tasks
            SET status = 'TRUE'
            WHERE id = ${id}
        `);
    }
}