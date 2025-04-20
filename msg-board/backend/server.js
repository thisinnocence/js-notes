import fastify from 'fastify';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import process from 'process';
import fastifyStatic from '@fastify/static';

class MessageBoardApp {
    constructor() {
        // 初始化 Fastify 应用
        this.app = fastify({ logger: true });
        this.port = 3000;
        this.setupDatabase();
        this.setupMiddleware();
        this.setupRoutes();
    }

    // 数据库设置 (保持不变)
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

    // 中间件设置 (调整为 Fastify 插件方式)
    async setupMiddleware() {
        // 静态文件服务
        await this.app.register(fastifyStatic, {
            root: path.resolve('./frontend'),
            prefix: '/'
        });
    }

    // 路由设置 (调整为 Fastify 路由语法)
    setupRoutes() {
        // 创建新消息
        this.app.post('/api/messages', async (request, reply) => {
            const { message, timestamp } = request.body;
            if (!message) {
                throw this.app.httpErrors.badRequest('Message content is required');
            }
            
            const newMessage = await this.Message.create({ 
                message,
                timestamp: timestamp || new Date()
            });
            return reply.code(201).send(newMessage);
        });

        // 获取所有消息
        this.app.get('/api/messages', async () => {
            const messages = await this.Message.findAll({
                order: [['timestamp', 'DESC']]
            });
            return messages;
        });

        // 更新消息
        this.app.put('/api/messages/:id', async (request, reply) => {
            const { id } = request.params;
            const { message } = request.body;
            
            if (!message) {
                throw this.app.httpErrors.badRequest('Message content is required');
            }

            const [updateCount, updatedMessages] = await this.Message.update(
                { message },
                { where: { id }, returning: true }
            );

            if (updateCount === 0) {
                throw this.app.httpErrors.notFound('Message not found');
            }
            return updatedMessages[0];
        });

        // 删除消息
        this.app.delete('/api/messages/:id', async (request, reply) => {
            const { id } = request.params;
            const result = await this.Message.destroy({ where: { id } });
            
            if (result === 0) {
                throw this.app.httpErrors.notFound('Message not found');
            }
            return reply.code(204).send();
        });

        // 主页面路由
        this.app.get('/', async (_, reply) => {
            return reply.sendFile('index.html', path.resolve('./frontend'));
        });

        // 错误处理 (Fastify 内置了错误处理，这里添加自定义处理)
        this.app.setErrorHandler((error, request, reply) => {
            this.app.log.error(error);
            if (error.statusCode) {
                return reply.code(error.statusCode).send({ error: error.message });
            }
            return reply.code(500).send({ error: 'Internal Server Error' });
        });
    }

    async start() {
        try {
            await this.sequelize.sync();
            await this.app.listen({ port: this.port });
            this.app.log.info(`Server running at http://localhost:${this.port}`);
        } catch (error) {
            this.app.log.error('Unable to start the server:', error);
            process.exit(1);
        }
    }
}

new MessageBoardApp().start();