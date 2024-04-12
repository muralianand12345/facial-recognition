import express from 'express';
import { v4 } from 'uuid';

import loginSchema from '../schema/loginSchema';
import { limiter } from '../function/auth';
import { CustomSession } from '../types';

const router = express.Router();

router.post('/login', limiter, async (req, res) => {
    const { empId, password } = req.body;

    if (!empId || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const user = await loginSchema.findOne({
            empId,
            password
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!req.session) {
            throw new Error("Session is not available");
        }

        const customSession = req.session as CustomSession;

        customSession.isLogin = true;
        customSession.empId = user.empId;
        customSession.sessionAuth = v4();
        req.session.save();

        

        return res.status(200).json({ message: 'Login successful', sessionAuth: customSession.sessionAuth });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }

});

export default router;