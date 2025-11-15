import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async({ to, subject, html }) => {
    try {
        const msg = {
            to,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject,
            html,
        };

        console.log('Attempting to send email to:', to);
        const info = await sgMail.send(msg);
        console.log('Email sent successfully:', info[0].statusCode, info[0].headers['x-message-id']);
        return info;
    } catch (error) {
        console.error('Error sending email via SendGrid:', error.response ? error.response.body : error);
        throw new Error('Failed to send email');
    }
};

export default sendEmail;