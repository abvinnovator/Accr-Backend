const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const cors = require('cors')
require('dotenv').config();

const prisma = new PrismaClient({datasources: {
  db: {
    url: process.env.DATABASE_URL
  },
},
});
const app = express();
app.use(express.json());
app.use(cors({
    origin: ["https://accre-frontend.vercel.app/"],
    credentials: true
}));
app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
      },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "brahmavamsi1234@gmail.com",
        pass: "pkti tpjo oycg okrr",
      },
    });

    const mailOptions = {
      from:"brahmavamsi1234@gmail.com",
      to: refereeEmail,
      subject: 'Referral Invitation',
      text: `Hi ${refereeName},\n\n${referrerName} has referred you to our course. Please join us!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'Referral submitted and email sent' });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
