import express from 'express';

import guestSchema from '../schema/guestSchema';
import guestOtpSchema from '../schema/guestOtpSchema';

const router = express.Router();

router.post('/guest', async (req, res) => {

    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Missing Email or OTP' });
    }

    try {

        const otpExists = await guestOtpSchema.findOne({ email });

        if (!otpExists) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (otpExists.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        await guestOtpSchema.deleteOne({ email });

        var guest = await guestSchema.findOne({ guestEmail: email });

        if (!guest) {
            guest = new guestSchema({ guestEmail: email });
        }

        const guestName = 'Guest_' + Math.floor(100000 + Math.random() * 900000).toString();
        guest.guestName = guestName;
        await guest.save();

        return res.status(200).json({ message: 'Guest registered successfully', guestName });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/guest/otp', async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(200).json({ message: 'Missing Email' });
    }

    try {

        const guest = await guestSchema.findOne({ guestEmail: email });

        if (guest) {
            return res.status(200).json({ message: 'Email already registered as guest' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(otp);
        const otpExists = await guestOtpSchema.findOne({ email });

        if (otpExists) {
            await guestOtpSchema.deleteOne({ email });
        }

        await guestOtpSchema.create({ email, otp });
        return res.status(200).json({ message: 'OTP sent successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
