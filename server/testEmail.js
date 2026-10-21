

import 'dotenv/config';
import transporter from './src/config/email.js';


const testEmail = async()=> {

    try {

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'ORA OTP email test',
            text: 'email is working successfully'
        });

        console.log('email sent successfully');
        
    }

    catch(error) {
        console.log('Email sending failed:', error.message);
        
    }
}

testEmail();