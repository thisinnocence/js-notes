import express from 'express';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

class MessageBoardApp {
    constructor() {
        this.app = express();
        this.port = 3000;
        this.setupDatabase();
        this.setupMiddleware();
        this.setupRoutes();
    }

    async setupDatabase() {
        this.db = await open({
            filename: './messages.db',
            driver: sqlite3.Database
        });

        await this.db.exec('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT)');
    }

    setupMiddleware() {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.set('view engine', 'ejs');
        this.app.set('views', path.resolve('./views'));
    }

    setupRoutes() {
        this.app.post('/message', async (req, res) => {
            const message = req.body.message;
            if (message) {
                await this.db.run('INSERT INTO messages (message) VALUES (?)', message);
            }
            res.redirect('/');
        });

        this.app.get('/', async (req, res) => {
            const messages = await this.db.all('SELECT message FROM messages');
            res.render('index', { messages: messages.map(row => row.message) });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}`);
        });
    }
}

new MessageBoardApp().start();
