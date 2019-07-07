import express from 'express';
import passport from 'passport';
import { getRepository } from 'typeorm';
import { Conversation, Message } from '../db/entity';

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {

    try {

        const { id } = req.user;

        const conversationRepo = getRepository(Conversation);
        const conversations = await conversationRepo.find({
            where: [
                { user1: id },
                { user2: id }
            ],
            relations: ['user1', 'user2']
        });

        return res.json({
            conversations
        });

    } catch (error) {

        return next(error);

    }

});

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {

    try {

        const { id } = req.user;
        const { selectedUserId } = req.body;

        if (!selectedUserId) {

            throw Error('No selectedUserId found in body.');

        }

        const conversationRepo = getRepository(Conversation);
        let conversation = new Conversation();
        conversation = await conversationRepo.save({
            ...conversation,
            user1: id,
            user2: selectedUserId
        });

        return res.json({
            conversation
        });

    } catch (error) {

        return next(error);

    }

});

router.get('/:id/messages', passport.authenticate('jwt', { session: false }), async (req, res, next) => {

    try {

        const { id } = req.params;

        if (!id) {

            throw Error('Missing id param');

        }

        const messageRepo = getRepository(Message);
        const messages = await messageRepo.find({
            order: {
                createdAt: 'ASC'
            },
            relations: ['from', 'to'],
            where: [
                { conversation: id }
            ],
        });

        return res.json({
            messages
        });

    } catch (error) {

        return next(error);

    }

});

export default router;
