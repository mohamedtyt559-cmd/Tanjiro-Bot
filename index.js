const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const express = require('express');
const readline = require('readline');

const app = express();
app.get('/', (req, res) => res.send('Tanjiro Bot Running!'));
app.listen(process.env.PORT || 3000);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') console.log('🔥 البوت متصل بنجاح!');
    });

    if (!sock.authState.creds.registered) {
        await delay(4000);
        const phoneNumber = await question('📱 أدخل رقم هاتف الواتساب مع رمز الدولة: ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n🔑 [ كود الربط الخاص بك ]: ${code}\n`);
    }

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = (msg.message.conversation || '').trim().toLowerCase();
        if (['.منيو', '.اوامر'].includes(text)) {
            await sock.sendMessage(msg.key.remoteJid, { text: "⛩️ أهلاً بك في إمبراطورية تانجيرو! البوت يعمل بنجاح 🚀" });
        }
    });
}
startBot();
