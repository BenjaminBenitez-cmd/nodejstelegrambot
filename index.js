const { Telegraf } = require('telegraf');
const search = require('youtube-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const getText = require('./convert');

require('dotenv');

const opts = {
  maxResults: 10,
  key: process.env.YOUTUBE_API,
}

const bot = new Telegraf(process.env.TELEGRAM_ACCESS_TOKEN);


bot.command('quit', (ctx) => {
  ctx.telegram.leaveChat(ctx.message.chat.id);

  ctx.leaveChat();
})

bot.on('voice', ctx => {
  //assign the file id to a variable
  const fileID = ctx.message.voice.file_id;
  //create a filename from variable's long name
  const fileName = fileID.substring(fileID.length - 5, fileID.length);
  //assign path to file location to variable
  const fileLocation = path.resolve(__dirname, 'tmp', `${fileName}.oga`);

  return ctx.telegram.getFileLink(fileID)
  .then((url) => {
    //receive url and pass it into axios request
    axios({
      url: url.href,
      method: 'GET',
      responseType: 'stream'
    })
    .then((response) => {
      writeToFile(response.data, fileLocation)
      .then(() => {
        getText(fileName)
        .then((response) => {
          ctx.reply(response);
        })
      })
    })
    .catch((err) => {
      console.log(err);
    })
  })
  .catch((err) => {
    console.log('**** error *****');
  })
});

function writeToFile(streamedData, filePath) {
  return new Promise((resolve, reject) => {
    const fileWriteStream = fs.createWriteStream(filePath);
    streamedData.pipe(fileWriteStream)
    .on('finish', () => resolve(() => console.log('resolved')))
    .on('error', () => reject('error'))
  })
}

bot.launch();

process.once('SIGNINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

