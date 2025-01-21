import express from 'express';
import path from 'path';

class MessageBoardApp {
    constructor() {
        this.app = express();
        this.port = 3000;
        this.messages = [];
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.set('view engine', 'ejs');
        this.app.set('views', path.resolve('./views'));
    }

    setupRoutes() {
        this.app.post('/message', (req, res) => {
            this.messages.push(req.body.message);
            res.redirect('/');
        });

        this.app.get('/', (req, res) => {
            res.render('index', { messages: this.messages });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}`);
        });
    }
}

new MessageBoardApp().start();
