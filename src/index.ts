import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import SocketServer from 'socket.io';
import { ConnectionOptions, createConnection, getRepository } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Conversation, Message, User } from './db/entity';
import { auth, conversations, users } from './routes';

dotenv.config();

const ormConfig: ConnectionOptions = {
    type: 'postgres',
    port: 5432,
    synchronize: true,
    // logging: true,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [Conversation, Message, User]
};

createConnection(ormConfig).then(_connection => {

    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    };

    const app = express();
    const httpServer = http.createServer(app);
    const io = SocketServer(httpServer, {
        origins: '*:*',
        serveClient: false
    });
    const port = process.env.PORT || 5000;

    passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {

        try {

            const userRepo = getRepository(User);
            const user = await userRepo.findOne(jwt_payload.id);

            if (user) {

                delete user.password;
                return done(null, user);

            }

            return done(null, false);

        } catch (error) {

            return done(error, false);

        }

    }));

    app.use(bodyParser.json());
    app.use((_req, res, next) => {

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        next();

    });

    app.get('/', (_req, res) => {

        res.send('What\'s cooking good looking?');

    });

    io.on('connection', async socket => {

        const { id } = socket.handshake.query;
        // save status to db and broadcast
        try {

            const userRepo = getRepository(User);
            const user = await userRepo.findOne(id, {
                select: ['id', 'isOnline', 'username']
            });

            if (user) {

                user.isOnline = true;
                await userRepo.save(user);
                socket.broadcast.emit('user-connectivity', { ...user });

            }

        } catch (error) {

            // TODO: send to sentry

        }

        socket.on('join-room', conversationId => {

            socket.join(conversationId);

        });

        socket.on('new-message', async event => {

            const { conversationId, from, message, to } = event;

            try {

                const conversationRepo = getRepository(Conversation);
                let conversation;

                if (!conversationId) {

                    conversation = new Conversation();
                    conversation = await conversationRepo.save({
                        ...conversation,
                        user1: from,
                        user2: to
                    });

                }

                const messageRepo = getRepository(Message);
                let newMessage = new Message();
                newMessage = await messageRepo.save({
                    ...newMessage,
                    conversation: conversationId || conversation.id,
                    from,
                    to,
                    message
                });

                io.sockets.in(conversationId).emit('update-conversation', newMessage);

            } catch (error) {

                // TODO: log to sentry

            }

        });

        socket.on('user-typing', event => {

            const { conversationId, isTyping, userId } = event;
            io.sockets.in(conversationId).emit('update-user-typing', {
                userId,
                isTyping
            });

        });

        socket.on('disconnect', async () => {

            try {

                const userRepo = getRepository(User);
                const user = await userRepo.findOne(id, {
                    select: ['id', 'isOnline', 'username']
                });

                if (user) {

                    user.isOnline = false;
                    await userRepo.save(user);
                    socket.broadcast.emit('user-connectivity', { ...user });

                }

            } catch (error) {

                // TODO: send to sentry

            }

        });

    });

    app.use('/auth', auth);
    app.use('/conversations', conversations);
    app.use('/users', users);

    httpServer.listen(port, () => {

        /*tslint:disable:no-console*/
        console.log(`Server listening on port: ${port}`);

    });

    // tslint:disable-next-line:no-console

}).catch(error => console.log('Error connecting to DB:::', error));
