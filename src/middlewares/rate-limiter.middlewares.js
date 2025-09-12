import rateLimit from "express-rate-limit";


export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res, next) => {
        res.status(429).json({ message: 'Too many requests from this IP, please try again after 15 minutes' });
    },
    legacyHeaders: false,
    standardHeaders: 'draft-7'
})