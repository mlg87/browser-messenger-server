import express from 'express';
import passport from 'passport';
import { Equal, getRepository, Not } from 'typeorm';
import { User } from '../db/entity';

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {

    try {

        const userRepo = getRepository(User);
        const [users, count] = await userRepo.findAndCount({
            order: {
                username: 'ASC'
            },
            select: ['id', 'isOnline', 'username'],
            where: {
                id: Not(Equal(req.user.id))
            }
        });

        return res.json({
            count,
            users
        });

    } catch (error) {

        return next(error);

    }

});

export default router;
