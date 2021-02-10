const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getText, writeToFile } = require('./functions');

require('dotenv');

//create new instance of telegraf
const bot = new Telegraf(process.env.TELEGRAM_ACCESS_TOKEN);

bot.on('voice',  async ctx => {
  //assign the file id to a variable
  const fileID = ctx.message.voice.file_id;
  //create a filename from variable's long name
  const fileName = fileID.substring(fileID.length - 5, fileID.length) + '.oga';
  //assign path to file location to variable
  const fileLocation = path.resolve(__dirname, 'tmp', `${fileName}`);

    //receive url and pass it into axios request
    try {
      const { href } = await ctx.telegram.getFileLink(fileID)
      const audio = await axios({
        url: href,
        method: 'GET',
        responseType: 'stream'
        });

      const file = await writeToFile(audio.data, fileLocation);

      if(file === 'error') {
        return ctx.reply('Server side error');
      }

      const message = await getText(fileName);

      return ctx.reply(message);
      
    } catch(err) {
      console.log(err);
      ctx.reply('There was an error');
    }
})



bot.launch();

process.once('SIGNINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

