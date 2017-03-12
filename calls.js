const twilio = require('twilio');
const ora = require('ora');
const schedule = require('node-schedule');
const download = require('download-file');
const dateTime = require('node-datetime');

const numbersAndNames = require('./data/numbers')
const keys = require('./data/keys');

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

    const downloadOpts = {
      directory: `./${keys.callDirectory}/${source}`,
      filename: `${day}.mp3`
    }
    let index = names.indexOf(source);
    download(url, downloadOpts, function(err){
        if (err) {
          downloadLog.fail(`ERROR: ${err} when trying to access ${url}.`);
        }

        deleteRecording(recordingId)
          .then((val) => {
            downloadLog.succeed(`Got ${source}/${downloadOpts.filename} and deleted original.`)
          },
          (error) => {
            downloadLog.fail(`Got ${source}/${downloadOpts.filename} but failed to delete original: ${error}.`)
          }).then(() => index !== names.length ? callAndRecord(numbers[++index]) : console.log("🍻 🍻 🍻 D O N E 🍻 🍻 🍻") )
    })
}

function scheduleCalls() {
  schedule.scheduleJob('31 4 * * *', function(){
    console.log(`\n🆒  🆒  🆒   ${day}  🆒  🆒  🆒`);
    callAndRecord(numbers[0]);
  });
}

function deleteRecording(id) {
  return new Promise((resolve, reject) => {
    client.recordings(id).delete(function(err, data) {
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

        const deleteLog = ora({
          'text': `Deleting file with ID ${recording.sid}`,
          'type': 'dots10',
          'color': 'magenta',
        }).start();

        deleteRecording(recording.sid)
          .then((val) => deleteLog.succeed(`Deleted recording with ID ${val}.`),
                (error) => deleteLog.fail(`Could not delete recording: ${error}.`))
      });
  });
}

module.exports = {
  callLog,
  deleteAllRecordings,
  handleFile,
  scheduleCalls
};
