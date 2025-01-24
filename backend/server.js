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
    }

    setupMiddleware() {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(express.static(path.resolve('./frontend')));
    }

    setupRoutes() {
        this.app.post('/api/messages', async (req, res) => {
            try {
                const { message } = req.body;
                if (message) {
                    const newMessage = await this.Message.create({ message });
                    res.status(201).json(newMessage);
                } else {
                    res.status(400).json({ error: 'Message content is required' });
                }
            } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.app.get('/api/messages', async (req, res) => {
            try {
                const messages = await this.Message.findAll({
                    order: [['createdAt', 'DESC']]
                });
                res.json(messages);
            } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.app.get('/', (req, res) => {
            res.sendFile(path.resolve('./frontend/index.html'));
        });
    }

    async start() {
        try {
            await this.sequelize.sync();
            this.app.listen(this.port, () => {
                console.log(`Server running at http://localhost:${this.port}`);
            });
        } catch (error) {
            console.error('Unable to start the server:', error);
        }
    }
}

new MessageBoardApp().start();
