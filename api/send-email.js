// Vercel Serverless Function to send emails via Nodemailer + Resend SMTP

import nodemailer from "nodemailer";

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY not configured");
        return res.status(500).json({ error: "Email service not configured. RESEND_API_KEY is missing." });
    }

    try {
        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ error: "Missing required fields: to, subject, html" });
        }

        // Create transporter inside handler to ensure env vars are available
        const transporter = nodemailer.createTransport({
            host: "smtp.resend.com",
            port: 465,
            secure: true,
            auth: {
                user: "resend",
                pass: process.env.RESEND_API_KEY,
            },
        });

        const info = await transporter.sendMail({
            from: "Liceo 8888 <noreply@citattendance.info>",
            to: Array.isArray(to) ? to.join(", ") : to,
            subject,
            html,
        });

        console.log("Email sent successfully:", info.messageId);
        return res.status(200).json({ success: true, id: info.messageId });
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: error.message });
    }
};
