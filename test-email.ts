
import { sendEmail } from './src/lib/email';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('Testing email sending...');
    try {
        await sendEmail('admin@admin.com', 'Test Email', '<h1>It works!</h1>');
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
