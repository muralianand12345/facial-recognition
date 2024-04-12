import express from 'express';

import { sessionAuth } from '../function/auth';

const router = express.Router();

router.post('/reload', sessionAuth, async (req, res) => {

    if (!req.session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const response = await fetch("http://127.0.0.1:5000/admin/reload", {
            method: "POST"
        });

        if (response.ok) {
            return res.status(200).json({ message: 'Reload successful' });
        } else {
            return res.status(400).json({ message: 'Unable to reload' });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/delete', sessionAuth, async (req, res) => {

    const { empId } = req.body;

    if (!empId) {
        return res.status(400).json({ message: 'Invalid request' });
    }

    if (!req.session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const response = await fetch("http://127.0.0.1:5000/admin/delete", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ empId })
        });

        const data = await response.json();

        if (data.code === 200) {
            return res.status(200).json({ message: `${empId} data deleted successfully` });
        } else {
            return res.status(400).json({ message: 'Unable to delete' });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;