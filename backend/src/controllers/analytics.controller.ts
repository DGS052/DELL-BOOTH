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
    const { fullName, organization, contactInfo, industry, activeMetric, activePreset, sliderConfig, timestamp } = req.body;
    
    if (!contactInfo) {
      return res.status(400).json({ error: 'Contact info is required' });
    }

    const leadData = `${fullName},${organization},${contactInfo},${industry},${activeMetric},${timestamp}\n`;
    
    // Append to local CSV file to ensure leads aren't lost
    const csvPath = path.join(__dirname, '../../leads.csv');
    fs.appendFileSync(csvPath, leadData);
    
    console.log('New Lead Captured:', { fullName, organization, contactInfo, industry });

    let previewUrl = null;

    // Send Email via Nodemailer if configured
    if (transporter) {
      // Check if contactInfo is an email or phone number.
      // If it has an '@', we can try sending to it. Otherwise use a fallback for ethereal.
      const isEmail = contactInfo.includes('@');
      const targetEmail = isEmail ? contactInfo : 'lead@teamcomputers.com'; // Will just sit in ethereal inbox

      const info = await transporter.sendMail({
        from: '"Team Computers & Dell" <no-reply@teamcomputers.com>',
        to: targetEmail,
        subject: `Your ${industry || 'Dell AI Factory'} PoC Request Confirmation`,
        text: `Hello ${fullName},\n\nThank you for requesting an On-Premise AI PoC with Team Computers.\nWe have received your configuration for ${industry || 'the environment'} - ${activeMetric}.\n\nOur enterprise services team will contact you shortly at ${contactInfo}.\n\nBest Regards,\nTeam Computers`,
        html: `<b>Hello ${fullName || 'Guest'},</b><br><br>Thank you for requesting an On-Premise AI PoC with Team Computers.<br>We have received your configuration for <b>${industry || 'the environment'}</b> - <b>${activeMetric}</b>.<br><br>Our enterprise services team will contact you shortly at <b>${contactInfo}</b>.<br><br>Best Regards,<br>Team Computers`
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
