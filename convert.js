const fs = require('fs');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
require('dotenv');

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({ apikey: process.env.IBM_API }),
  serviceUrl: 'https://api.us-south.speech-to-text.watson.cloud.ibm.com'
});

  function getText(filename) {
    const params = {
      audio: fs.createReadStream(`./tmp/${filename}.oga`),
      contentType: 'audio/ogg'
    };
    return new Promise((resolve, reject) => {
      speechToText.recognize(params)
      .then(response => {
        console.log(response.result.results[0].alternatives[0].transcript);
        resolve(response.result.results[0].alternatives[0].transcript);
      })
      .catch(err => {
        reject(err);
      });
    })
  }

  module.exports = getText;