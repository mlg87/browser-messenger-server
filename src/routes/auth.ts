import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jwt-simple';
import passport from 'passport';
import { getRepository } from 'typeorm';
import { User } from '../db/entity';

const router = express.Router();

router.get('/validate', passport.authenticate('jwt', { session: false }), (req, res) => {

    res.json({
        user: req.user
    });

});

// TODO: make middleware to validate body
router.post('/login', async (req, res, next) => {

    try {

        const { username, password } = req.body;
        const userRepo = getRepository(User);
        const user = await userRepo.findOne(
            {
                username
            },
            {
                select: ['id', 'username', 'password']
            }
        );

        if (!user) {

            return res.status(404).json({
                message: 'No user found with that username'
            });

        }

        const token = await comparePassword(password, user.password, user.id);
        delete user.password;

        return res.json({
            token,
            user
        });

    } catch (error) {

        return next(error);

    }

});

router.post('/register', async (req, res, next) => {

    try {

        const { username, password } = req.body;
        const userRepo = getRepository(User);
        const existingUser = await userRepo.findOne({ username });

        if (existingUser) {

            return res.status(409).json({
                message: 'User with that username exists.'
            });

        }

        const hash = await bcrypt.hash(password, 10);
        let newUser = new User();

        newUser = await userRepo.save({
            ...newUser,
            username,
            isOnline: true,
            password: hash
        });

        delete newUser.password;

        return res.json({
            token: signToken(newUser.id),
            user: newUser
        });

    } catch (error) {

        return next(error);

    }

});

//
// ─── HELPERS ────────────────────────────────────────────────────────────────────
//

const comparePassword = async (eventPassword: string, hashedPassword: string, userId: number) => {

    const isValid = await bcrypt.compare(eventPassword, hashedPassword);

    if (isValid) {

        return signToken(userId);

    }

    return Promise.reject(new Error('The credentials do not match.'));

};

const signToken = (id: number) => {

    return jwt.encode({ id }, process.env.JWT_SECRET || 'super secret');

};

export default router;
