
import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        console.warn('SMTP configuration missing: Emails will not be sent.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: SMTP_FROM || SMTP_USER,
            to,
            subject,
            html,
        });
        console.log(`Email sent to ${to}`);

        // Log Ethereal URL for development
        if (SMTP_HOST.includes('ethereal.email')) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};
