const twilio = require('twilio');
const ora = require('ora');
const schedule = require('node-schedule');
const dateTime = require('node-datetime');

const numbersAndNames = require('./data/numbers')
const keys = require('./data/keys');
const utils = require('./utils')

const client = new twilio.RestClient(keys.twilioKey, keys.twilioToken);
const threeMinutes = 180000; // in ms
const myNumber = keys.twilioNumber;

let callLog = {}
const numbers = Object.keys(numbersAndNames);
const names = numbers.map((number) => numbersAndNames[number]);
const day = dateTime.create().format('m_d_Y');

function callAndRecord(numberToCall) {
  const placeName = numbersAndNames[numberToCall];

  console.log('');
  callLog = {};
  callLog = ora({
    'text': `Now calling ${placeName} at ${numberToCall}`,
    'color': 'magenta',
    'spinner': 'dots10'
  }).start();

  client.calls.create({
      from: myNumber,
      to: numberToCall,
      method: "GET",
      recordingStatusCallback: `${keys.serverPath}/process_call/${numberToCall}`,
      record: true,
      url: `${keys.pathToCallManifest}call.xml`
  }, function(err) {
      if(err) {
        callLog.fail(`Failed to call ${placeName}: ${err}.`)
      }
  });
}

function handleFile (url, source, recordingId) {

  callLog.succeed(`Finished with the call to ${source}.`)

  const downloadLog = ora({
    'text': `Downloading recording of call to ${source}.`,
    'type': 'dots10',
    'color': 'magenta',
  }).start();

  const fileTag = `${source}/${day}.mp3`
  const filePath = `./${keys.callDirectory}/${fileTag}`
  let index = names.indexOf(source);

  utils.downloadRecording(url, filePath)
  .then((val) => downloadLog.succeed(`Downloaded recording to ${fileTag}.`),
        (error) => downloadLog.fail(`Could not download recording: ${error}.`))
  .then(() => {
    if(index+1 !== names.length) {
      callAndRecord(numbers[++index])
    } else {
      console.log("🍻 🍻 🍻 D O N E 🍻 🍻 🍻")
    }
  })
}

function scheduleCalls() {
  schedule.scheduleJob('0 10 * * *', function(){
    console.log(`\n🆒  🆒  🆒   ${day}  🆒  🆒  🆒`);
    callAndRecord(numbers[0]);
  });

  schedule.scheduleJob('0 5 * * *', function() {
    deleteAllRecordings();
  })
}

function deleteRecording(id) {
  return new Promise((resolve, reject) => {
    client.recordings(id).delete(function(err) {
      if (err) {
        reject(err)
      } else {
        resolve(id)
      }
    });
  })
}

function deleteAllRecordings() {
  client.recordings.list(function(err, data) {
      data.recordings.forEach(function(recording) {
        deleteRecording(recording.sid)
        .then((val) => console.log(`✌️  ✌️  ✌️  Deleted recording with ID ${val}. ✌️  ✌️  ✌️`),
              (error) => console.log(`🤷 🤷 🤷  Could not delete recording: ${error}. 🤷 🤷 🤷`))
      });
  });
}

module.exports = {
  callLog,
  deleteAllRecordings,
  handleFile,
  scheduleCalls
};
