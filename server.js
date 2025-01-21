import express from 'express';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';

class MessageBoardApp {
    constructor() {
        this.app = express();
        this.port = 3000;
        this.setupDatabase();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupDatabase() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './messages.db'
        });

        this.Message = this.sequelize.define('Message', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        });

        this.sequelize.sync();
    }

    setupMiddleware() {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.set('view engine', 'ejs');
        this.app.set('views', path.resolve('./views'));
        this.app.use(express.static(path.resolve('./public')));
    }

    setupRoutes() {
        this.app.post('/message', async (req, res) => {
            const message = req.body.message;
            if (message) {
                await this.Message.create({ message });
            }
            res.redirect('/');
        });

        this.app.get('/', async (req, res) => {
            const messages = await this.Message.findAll();
            res.render('index', { messages: messages.map(msg => msg.message) });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}`);
        });
    }
}

new MessageBoardApp().start();
