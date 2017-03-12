const express = require('express');
const bodyParser = require("body-parser");
const download = require('download-file');
const dateTime = require('node-datetime');
const request = require('request');
const serveIndex = require('serve-index');
const ora = require('ora');

const calls = require('./calls');
const numbers = require('./data/numbers');
const keys = require('./data/keys');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/`))
app.use(`/${keys.callDirectory}`, serveIndex(`${__dirname}/${keys.callDirectory}`));
app.use(express.static('public'))

app.post('/process_call/:numberCalled', function (req, res) {
  res.sendStatus(200)

  data = req.body

  let source = numbers[req.params.numberCalled];
  let url = `${data.RecordingUrl}.mp3`
  let dt = dateTime.create();
  let day = dt.format('m_d_Y');

  calls.callLog.succeed(`Finished With the call to ${source}`)

  let downloadOpts = {
    directory: `./${keys.callDirectory}/${source}`,
    filename: `${day}.mp3`
  }

  const downloadLog = ora({
    'text': `Downloading file`,
    'type': 'dots10',
    'color': 'magenta',
  }).start();

  download(url, downloadOpts, function(err){
      if (err) {
        downloadLog.fail(`ERROR: ${err} when trying to access ${url}`);
      }

      if(calls.deleteRecording(data.RecordingSid)) {
        downloadLog.succeed(`Got ${source}/${downloadOpts.filename} and deleted original`)
      } else {
        downloadLog.fail(`Got ${source}/${downloadOpts.filename} but failed to delete original`)
      }
  })
})

app.listen(8080, function () {
  console.log('🐚  🐚  🐚   S E R V E R  U P  🐚  🐚  🐚');
  calls.scheduleCalls();
})
