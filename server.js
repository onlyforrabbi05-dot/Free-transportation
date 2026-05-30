const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

// 🚨 এখানে আপনার আসল টেলিগ্রাম বট টোকেনটি বসিয়ে দিন
const TOKEN = '8752345061:AAFIZ2OKSZ4IDkjnFbPBtVDp5rSRGv6SXJI';

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// Socket.io CORS কনফিগারেশন
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// টেলিগ্রাম বট ইনস্ট্যান্স
const bot = new TelegramBot(TOKEN, { polling: true });

// সরাসরি মেইন ফোল্ডারের index.html ফাইলটি ব্রাউজারে পাঠানো
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// টেলিগ্রাম বটের মেসেজ হ্যান্ডলার
bot.on('message', async (msg) => {
  let data = {
    type: 'text',
    content: msg.text || '',
    caption: msg.caption || '',
    time: new Date().toLocaleTimeString()
  };
  
  try {
    if (msg.photo) {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const fileLink = await bot.getFileLink(fileId);
      data.type = 'image';
      data.content = fileLink;
    }
    else if (msg.video) {
      const fileId = msg.video.file_id;
      const fileLink = await bot.getFileLink(fileId);
      data.type = 'video';
      data.content = fileLink;
    }
    
    // ওয়েবসাইটে লাইভ ডেটা পাঠানো
    io.emit('tg-message', data);
  } catch (error) {
    console.error("Error processing telegram message:", error);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});