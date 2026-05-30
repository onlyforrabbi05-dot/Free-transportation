const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

// 🚨 এখানে আপনার আসল টেলিগ্রাম বট টোকেনটি বসিয়ে দিন
const TOKEN = '8752345061:AAFIZ2OKSZ4IDkjnFbPBtVDp5rSRGv6SXJI'; 
// 🚨 ওয়েবসাইট থেকে ডিলিট করার জন্য আপনার গোপন পাসওয়ার্ড এখানে দিন
const ADMIN_PASSWORD = 'you know my name'; 

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const bot = new TelegramBot(TOKEN, { polling: true });

let messageHistory = [];
const MAX_HISTORY = 30;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    // নতুন কানেকশনে পুরোনো হিস্টোরি পাঠানো
    socket.emit('history', messageHistory);

    // ওয়েবসাইট থেকে ডিলিট রিকোয়েস্ট হ্যান্ডেল করা
    socket.on('request-delete', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            // হিস্টোরি অ্যারে থেকে ওই আইডি-র মেসেজটি বাদ দেওয়া
            messageHistory = messageHistory.filter(msg => msg.id !== data.id);
            // সব কানেক্টেড ব্রাউজারকে জানানো যেন ওরাও স্ক্রিন থেকে ডিলিট করে দেয়
            io.emit('message-deleted', data.id);
        } else {
            socket.emit('delete-error', 'ভুল পাসওয়ার্ড! আপনি ডিলিট করতে পারবেন না।');
        }
    });
});

bot.on('message', async (msg) => {
    // প্রতিটি মেসেজের জন্য একটি ইউনিক আইডি তৈরি
    let uniqueId = msg.message_id + '-' + Date.now();

    let data = {
        id: uniqueId,
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

        if (!data.content && !data.caption) return;

        messageHistory.unshift(data);
        if (messageHistory.length > MAX_HISTORY) {
            messageHistory.pop();
        }

        io.emit('tg-message', data);
    } catch (error) {
        console.error("Error processing telegram message:", error);
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});            messageHistory = messageHistory.filter(msg => msg.id !== data.id);
            
            // সব কানেক্টেড ব্রাউজারকে জানানো যেন তারাও স্ক্রিন থেকে ডিলিট করে দেয়
            io.emit('message-deleted', data.id);
        } else {
            socket.emit('delete-error', 'ভুল পাসওয়ার্ড! আপনি ডিলিট করতে পারবেন না।');
        }
    });
});

bot.on('message', async (msg) => {
    // প্রতিটি মেসেজের জন্য একটি ইউনিক আইডি তৈরি (টেলিগ্রাম মেসেজ আইডি + টাইমস্ট্যাম্প)
    let uniqueId = msg.message_id + '-' + Date.now();

    let data = {
        id: uniqueId,
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

        if (!data.content && !data.caption) return;

        messageHistory.unshift(data);
        if (messageHistory.length > MAX_HISTORY) {
            messageHistory.pop();
        }

        io.emit('tg-message', data);
    } catch (error) {
        console.error("Error processing telegram message:", error);
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});  };
  
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
