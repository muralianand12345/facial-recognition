import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import session from 'express-session';
import bodyParser from 'body-parser';
import { v4 } from 'uuid';

import { checkAuth } from './function/auth';
import loginRouter from './route/login';
import apiRouter from './route/admin_api';
import registerRouter from './route/register_api';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error('Mongo URI is required');
}

connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error(err);
    });

const secretKey = v4();
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/models', express.static(path.join(__dirname, './web/models')));
app.use('/css', express.static(path.join(__dirname, './web/css')));
app.use('/js', express.static(path.join(__dirname, './web/js')));

app.use('/auth', loginRouter);
app.use('/api/admin', apiRouter);
app.use('/api/register', registerRouter);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './web/home.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, './web/capture_emp.html'));
});

app.get('/guest', (req, res) => {
    res.sendFile(path.join(__dirname, './web/capture_guest.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './web/login.html'));
});

app.get('/admin', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, './web/admin.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, './web/404.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(err);
});

process.on('uncaughtException', (err) => {
    console.error(err);
});