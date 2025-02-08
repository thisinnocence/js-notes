import express from 'express';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import process from 'process';

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
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        });
    }

    setupMiddleware() {
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(express.static(path.resolve('./frontend')));
        this.app.use(this.errorHandler.bind(this));
    }

    // 统一的错误处理中间件
    errorHandler(err, _req, res, next) {
        console.error('Error:', err);
        res.statusCode = err.status || 500;
        res.json({ error: err.message || 'Internal Server Error' });
        next();
    }

    // 统一的异步处理包装器
    asyncHandler(fn) {
        return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
    }

    setupRoutes() {
        this.app.post('/api/messages', this.asyncHandler(async (req, res) => {
            const { message, timestamp } = req.body;
            if (!message) throw { status: 400, message: 'Message content is required' };
            
            const newMessage = await this.Message.create({ 
                message,
                timestamp: timestamp || new Date()
            });
            res.status(201).json(newMessage);
        }));

        this.app.get('/api/messages', this.asyncHandler(async (req, res) => {
            const messages = await this.Message.findAll({
                order: [['timestamp', 'DESC']]
            });
            res.json(messages);
        }));

        this.app.put('/api/messages/:id', this.asyncHandler(async (req, res) => {
            const { id } = req.params;
            const { message } = req.body;
            
            if (!message) throw { status: 400, message: 'Message content is required' };

            const [updateCount, updatedMessages] = await this.Message.update(
                { message },
                { where: { id }, returning: true }
            );

            if (updateCount === 0) throw { status: 404, message: 'Message not found' };
            res.json(updatedMessages[0]);
        }));

        this.app.delete('/api/messages/:id', this.asyncHandler(async (req, res) => {
            const { id } = req.params;
            const result = await this.Message.destroy({ where: { id } });
            
            if (result === 0) throw { status: 404, message: 'Message not found' };
            res.status(204).send();
        }));

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
            process.exit(1);
        }
    }
}

new MessageBoardApp().start();
