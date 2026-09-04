import { Request, Response } from 'express';
import { trackAnalytics } from '../services/analytics.service';

export const track = (req: Request, res: Response) => {
  try {
    const { industry, action, timestamp } = req.body;
    
    if (!industry || !action || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = trackAnalytics({ industry, action, timestamp });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
// (Using Ethereal for testing, creates a test account on the fly)
let transporter: nodemailer.Transporter | null = null;
nodemailer.createTestAccount().then(account => {
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
}).catch(err => console.error('Failed to create test email account', err));

export const captureLead = async (req: Request, res: Response) => {
  try {
    const { email, selectedIndustry, inferenceVolume, timestamp } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const leadData = `${email},${selectedIndustry},${inferenceVolume},${timestamp}\n`;
    
    // Append to local CSV file to ensure leads aren't lost
    const csvPath = path.join(__dirname, '../../leads.csv');
    fs.appendFileSync(csvPath, leadData);
    
    console.log('New Lead Captured:', { email, selectedIndustry, inferenceVolume });

    let previewUrl = null;

    // Send Email via Nodemailer if configured
    if (transporter) {
      const info = await transporter.sendMail({
        from: '"Dell AI Factory" <no-reply@dellaifactory.com>',
        to: email,
        subject: "Your Detailed ROI Report - Dell AI Factory",
        text: `Hello,\n\nThank you for exploring the Dell AI Factory Kiosk.\nHere is your requested ROI report for the ${selectedIndustry} environment with a daily inference volume of ${inferenceVolume}.\n\nBest Regards,\nTeam Computers`,
        html: `<b>Hello,</b><br><br>Thank you for exploring the Dell AI Factory Kiosk.<br>Here is your requested ROI report for the <b>${selectedIndustry}</b> environment with a daily inference volume of <b>${inferenceVolume}</b>.<br><br>Best Regards,<br>Team Computers`
      });
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", previewUrl);
    }
    
    return res.status(200).json({ success: true, message: 'Lead captured successfully', previewUrl });
  } catch (error) {
    console.error('Error capturing lead:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
