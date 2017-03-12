const twilio = require('twilio');
const ora = require('ora');
const schedule = require('node-schedule');
const numbers = require('./data/numbers')
const keys = require('./data/keys');

const client = new twilio.RestClient(keys.twilioKey, keys.twilioToken);
const threeMinutes = 180000; // in ms
const myNumber = keys.twilioNumber;


const callLog = ora({
  type: 'dots10',
  color: 'magenta'
});

function callAndRecord(numberToCall) {
  const placeName = numbers[numberToCall];

  callLog.text = `Calling ${placeName} at ${numberToCall}`
  callLog.start();

  client.calls.create({
      from: myNumber,
      to: numberToCall,
      method: "GET",
      recordingStatusCallback: `${keys.serverPath}/process_call/${numberToCall}`,
      record: true,
      url: `${keys.pathToCallManifest}call.xml`
  }, function(err) {
      if(err) {
        callLog.fail(`Failed to call ${placeName}: ${err}`)
      }
  });
}

function scheduleCalls() {
  schedule.scheduleJob('43 1 * * *', function(){
   Object.keys(numbers).map(function(number, index){
     let delayTime = threeMinutes*index;
     return setTimeout(callAndRecord,delayTime,number)
   })
 });
}

function deleteRecording(id) {
  client.recordings(id).delete(function(err, data) {
    if (err) {
        console.log(err.status);
        throw err.message;
        return false;
    } else {
      return true;
    }
  });
}

function deleteAllRecordings () {
  client.recordings.list(function(err, data) {
      data.recordings.forEach(function(recording) {
          deleteRecording(recording.sid)
      });
  });
}

module.exports = {
  callLog,
  deleteRecording,
  deleteAllRecordings,
  scheduleCalls
};
