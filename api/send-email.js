// Vercel Serverless Function to send emails via Resend API

const { Resend } = require("resend");

module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return res.status(500).json({ error: 'Email service not configured' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
        }

        const { data, error } = await resend.emails.send({
            from: 'Liceo 8888 <noreply@citattendance.info>',
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            console.error('Resend API error:', error);
            return res.status(400).json({ error: error.message || 'Failed to send email' });
        }

        console.log('Email sent successfully:', data.id);
        return res.status(200).json({ success: true, id: data.id });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: error.message });
    }
};
