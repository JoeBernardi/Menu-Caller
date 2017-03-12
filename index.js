const express = require('express');
const bodyParser = require("body-parser");
const serveIndex = require('serve-index');

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
  const url = `${data.RecordingUrl}.mp3`;
  const source = numbers[req.params.numberCalled];
  const recordingId = data.RecordingSid;

  calls.handleFile(url, source, recordingId);
})

app.listen(8080, function () {
  console.log('🐚  🐚  🐚   S E R V E R  U P  🐚  🐚  🐚');
  calls.deleteAllRecordings();
  calls.scheduleCalls();
})
