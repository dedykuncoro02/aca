const { Client, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fs = require('fs');
const { phoneNumberFormatter } = require('./helpers/formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: true
}));

const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  session: sessionCfg
});

client.on('message', msg => {
  if (msg.body == '!ping') {
    const contact =  msg.getContact();
        const chat = msg.getChat();
        console.log(contact.number+'yesss');
  } else if (msg.body == 'good morning') {
    msg.reply('selamat pagi');
  } else if (msg.body == '!groups') {
    client.getChats().then(chats => {
      const groups = chats.filter(chat => chat.isGroup);

      if (groups.length == 0) {
        msg.reply('You have no group yet.');
      } else {
        let replyMsg = '*YOUR GROUPS*\n\n';
        groups.forEach((group, i) => {
          console.log(group.name);
         //replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
        });
        replyMsg += '_You can use the group id to send a message to the group._'
        msg.reply(replyMsg);
      } 
    });
  } else if (msg.body == '!getcontact') {
        msg.getContact().then(contact => {
          let nomor = '0'+contact.number.substring(2, 15);
          console.log(nomor);
          
        });
    } else if (msg.body == '!info') {
        client.getChats().then(chats => {
          const groups = chats.filter(chat => chat.isGroup);

          if (groups.length == 0) {
            msg.reply('You have no group yet.');
          } else {
            let replyMsg = '*YOUR GROUPS*\n\n';
            groups.forEach((group, i) => {
              if (group.isGroup === true && group.name != undefined && group.id.user == '6285701139686-1600652371') 
                { console.log(group.name ,group.participants.length);
                  group.participants.forEach((nomor, c) => {

                    console.log('0'+nomor.id.user.substring(2)+",");
                   //replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
                  });
                 }
             //replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
            });
            replyMsg += '_You can use the group id to send a message to the group._'
            msg.reply(replyMsg);
          } 
        });
    } else if (msg.body.startsWith('!totaldonasi')) {

        msg.getContact().then(contact => {
          let nomor = '0'+contact.number.substring(2, 15);
          console.log(nomor);
          
        

        var mysql = require('mysql');

        var con = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "",
          database: "acaevent"
        });

        con.connect(function(err) {
          if (err) throw err;
          con.query("SELECT donatur.donatur_nama as nama ,SUM(donasi.donasi_nominal) as total FROM donatur LEFT JOIN donasi ON donatur.donatur_id = donasi.donasi_donatur_id WHERE donatur.donatur_handphone = '"+nomor+"';", function (err, result, fields) {
            if (err) throw err;
            var rows = JSON.parse(JSON.stringify(result[0]));
            console.log(rows.nama,rows.total);
            client.sendMessage(msg.from, 'Assalamualaikum bapak/ibu '+rows.nama+",\n\n Alhamdulillah hingga saat ini bapak/ibu telah berjuang membela Palestina\n\nTotal Donasi yang telah dipercayakan kepada kami sebesar :"+rows.total+"\n\nSemoga bapak/ibu selalu diberi kelancaran rezeki, kesehatan , serta umur berkah. Aamiin.\n===========================\nUntuk saat ini kami sedang memfokuskan untuk program Qurban dengan harga:\n\n*Qurban Palestina* : 5,5jt\n\n*Qurban Indonesia* : 2,7jt\n\nRekening BSI : *(451) 7171-5588-88*\nA/N Amal Cinta Al-Aqsa\n===========================\n\nInstagram : @amalcintaalaqsha\nWebsite : www.amalcintaalaqsha.org");
          });
        });
        });

    }else if (msg.body.startsWith('!wakaf')) {
        msg.getContact().then(contact => {
          let nomor = '0'+contact.number.substring(2, 15);
          console.log(nomor);
          
        

        var mysql = require('mysql');

        var con = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "",
          database: "acaevent"
        });

        con.connect(function(err) {
          if (err) throw err;
          con.query("SELECT donatur.donatur_nama as nama ,SUM(donasi.donasi_nominal) as total FROM donatur LEFT JOIN donasi ON donatur.donatur_id = donasi.donasi_donatur_id WHERE donatur.donatur_handphone = '"+nomor+"' AND donasi.donasi_program = 'wakaf';", function (err, result, fields) {
            if (err) throw err;
            var rows = JSON.parse(JSON.stringify(result[0]));
            console.log(rows.nama,rows.total);
            client.sendMessage(msg.from, 'Assalamualaikum bapak/ibu '+rows.nama+",\n\n Alhamdulillah hingga saat ini bapak/ibu telah berjuang membela Palestina\n\nTotal Donasi yang telah dipercayakan kepada kami sebesar :"+rows.total+"\n\nSemoga bapak/ibu selalu diberi kelancaran rezeki, kesehatan , serta umur berkah. Aamiin.\n===========================\nUntuk saat ini kami sedang memfokuskan untuk program Qurban dengan harga:\n\n*Qurban Palestina* : 5,5jt\n\n*Qurban Indonesia* : 2,7jt\n\nRekening BSI : *(451) 7171-5588-88*\nA/N Amal Cinta Al-Aqsa\n===========================\n\nInstagram : @amalcintaalaqsha\nWebsite : www.amalcintaalaqsha.org");
          });
        });
        });


    }else if (msg.body.startsWith('!alldonation')) {
        msg.getContact().then(contact => {
          let nomor = '0'+contact.number.substring(2, 15);
          console.log(nomor);
          
        if (nomor == "085877703176") {

          var mysql = require('mysql');

          var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "acaevent"
          });

          con.connect(function(err) {
            if (err) throw err;
            con.query("SELECT SUM(donasi.donasi_nominal) as total FROM donasi;", function (err, result, fields) {
              if (err) throw err;
              var rows = JSON.parse(JSON.stringify(result[0]));
              console.log(rows.total);
              client.sendMessage(msg.from, "Total Donasi Amal Cinta Al-Aqsha :"+rows.total+"");
            });
          });
        }else{
          msg.reply('nomor anda tidak memiliki akses');
        }
        });


    }else if (msg.body.startsWith('!wakaf')) {
        msg.getContact().then(contact => {
          let nomor = '0'+contact.number.substring(2, 15);
          console.log(nomor);
          
        

        var mysql = require('mysql');

        var con = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "",
          database: "acaevent"
        });

        con.connect(function(err) {
          if (err) throw err;
          con.query("SELECT donatur.donatur_nama as nama ,SUM(donasi.donasi_nominal) as total FROM donatur LEFT JOIN donasi ON donatur.donatur_id = donasi.donasi_donatur_id WHERE donatur.donatur_handphone = '"+nomor+"' AND donasi.donasi_program = 'wakaf';", function (err, result, fields) {
            if (err) throw err;
            var rows = JSON.parse(JSON.stringify(result[0]));
            console.log(rows.nama,rows.total);
            client.sendMessage(msg.from, "");
          });
        });
        });


    }

});

client.initialize();

// Socket IO
io.on('connection', function(socket) {
  socket.emit('message', 'Connecting...');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QR Code received, scan please!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp is ready!');
  });

  client.on('authenticated', (session) => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated!');
    console.log('AUTHENTICATED', session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
      if (err) {
        console.error(err);
      }
    });
  });

  client.on('auth_failure', function(session) {
    socket.emit('message', 'Auth failure, restarting...');
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'Whatsapp is disconnected!');
    fs.unlinkSync(SESSION_FILE_PATH, function(err) {
        if(err) return console.log(err);
        console.log('Session file deleted!');
    });
    client.destroy();
    client.initialize();
  });
});


const checkRegisteredNumber = async function(number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}

// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Send media
app.post('/send-media', async (req, res) => {
  const number = phoneNumberFormatter(req.body.number);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  // const media = MessageMedia.fromFilePath('./image-example.png');
  // const file = req.files.file;
  // const media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name);
  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  client.sendMessage(number, media, {
    caption: caption
  }).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

const findGroupByName = async function(name) {
  const group = await client.getChats().then(chats => {
    return chats.find(chat => 
      chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
    );
  });
  return group;
}

// Send message to group
// You can use chatID or group name, yea!
app.post('/send-group-message', [
  body('id').custom((value, { req }) => {
    if (!value && !req.body.name) {
      throw new Error('Invalid value, you can use `id` or `name`');
    }
    return true;
  }),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  let chatId = req.body.id;
  const groupName = req.body.name;
  const message = req.body.message;

  // Find the group by name
  if (!chatId) {
    const group = await findGroupByName(groupName);
    if (!group) {
      return res.status(422).json({
        status: false,
        message: 'No group found with name: ' + groupName
      });
    }
    chatId = group.id._serialized;
  }

  client.sendMessage(chatId, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Clearing message on spesific chat
app.post('/clear-message', [
  body('number').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  const chat = await client.getChatById(number);
  
  chat.clearMessages().then(status => {
    res.status(200).json({
      status: true,
      response: status
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  })
});

server.listen(port, function() {
  console.log('App running on *: ' + port);
});
