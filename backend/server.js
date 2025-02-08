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
    }

    setupRoutes() {
        this.app.post('/api/messages', async (req, res) => {
            try {
                const { message, timestamp } = req.body;
                if (!message) {
                    return res.status(400).json({ error: 'Message content is required' });
                }
                const newMessage = await this.Message.create({ 
                    message,
                    timestamp: timestamp || new Date()
                });
                res.status(201).json(newMessage);
            } catch (error) {
                console.error('Error creating message:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.app.get('/api/messages', async (req, res) => {
            try {
                const messages = await this.Message.findAll({
                    order: [['timestamp', 'DESC']]
                });
                res.json(messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.app.put('/api/messages/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const { message } = req.body;
                
                if (!message) {
                    return res.status(400).json({ error: 'Message content is required' });
                }

                const [updateCount, updatedMessages] = await this.Message.update(
                    { message },
                    { 
                        where: { id },
                        returning: true
                    }
                );

                if (updateCount === 0) {
                    return res.status(404).json({ error: 'Message not found' });
                }

                res.json(updatedMessages[0]);
            } catch (error) {
                console.error('Error updating message:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.app.delete('/api/messages/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.Message.destroy({
                    where: { id }
                });
                if (result === 0) {
                    return res.status(404).json({ error: 'Message not found' });
                }
                res.status(204).send();
            } catch (error) {
                console.error('Error deleting message:', error);
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
