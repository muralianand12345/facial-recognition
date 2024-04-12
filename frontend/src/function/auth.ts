import { Request, Response, NextFunction } from 'express';
import rateLimit from "express-rate-limit";

import { CustomSession } from '../types';

const checkAuth = (req: Request & { session: CustomSession }, res: Response, next: NextFunction) => {
    if (!req.session.isLogin) {
        return res.redirect('/login');
    }
    next();
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { code: 429, message: 'Too many requests, please try again later' }
});

const sessionAuth = (req: Request & { session: CustomSession }, res: Response, next: NextFunction) => {
    if (!req.session) {
        res.status(500).json({ code: 500, message: "Internal server error." });
        return;
    }

    let sessionAuth = req.session?.sessionAuth;
    let headerAuth = req.header('x-api-key');
    if (sessionAuth && headerAuth && sessionAuth === headerAuth) {
        next();
    } else {
        res.status(403).json({ code: 403, message: "Forbidden. Invalid Session Auth" });
    }
}

export { checkAuth, limiter, sessionAuth };