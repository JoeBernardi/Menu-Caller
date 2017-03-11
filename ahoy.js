const twilio = require('twilio');
const schedule = require('node-schedule');
const keys = require('./keys')

const client = new twilio.RestClient(keys.twilioKey, keys.twilioToken);

const threeMinutes = 180000; // in ms
const myNumber = keys.twilioNumber;

const numbersToCall = [
  "+15103517654",  // "bancroft"
  "+12127466368", // "weill_cornell"
  "+12123053287", // "spine_ny"
  "+16177246368", // "MGH"
  "+14142786993", // "milwaukee_public"
  "+16077985236", // "lourdes_binghamton"
  "+19527675579", // "westwood_lutheran"
  "+14357165411", // "logan_regional"
  "+17062132526", // "elbert_memorial"
  "+19857854286", // "st_charles_parish"
  "+15058468050" // "kirtland_air_force"
]

function callAndRecord(numberToCall) {
  console.log(`Calling ${numberToCall}`);
  client.calls.create({
      url: `${keys.pathToCallManifest}call.xml`,
      method: "GET",
      to: numberToCall,
      statusCallback: `${keys.serverPath}/process_call`,
      from: myNumber,
      record: true
  }, function(err) {
      if(err) {
        console.log(err)
      } else {
        console.log(`Finished Calling ${numberToCall}`);
      }
  });
}

let c = schedule.scheduleJob('47 22 * * *', function(){
  numbersToCall.map(function(number, index){
    let delayTime = threeMinutes*index;
    return setTimeout(callAndRecord,delayTime,number)
  })
});
