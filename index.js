const express = require('express');
const bodyParser = require("body-parser");
const download = require('download-file');
const dateTime = require('node-datetime');
const request = require('request');
const serveIndex = require('serve-index')

const app = express();
const call_directory = "./call_logs";

const numbers = {
  "+12127466368": "weill_cornell",
  "+12123053287": "spine_ny",
  "+16177246368": "MGH",
  "+15103517654": "bancroft",
  "+14142786993": "milwaukee_public",
  "+16077985236": "lourdes_binghamton",
  "+19527675579": "westwood_lutheran",
  "+14357165411": "logan_regional",
  "+17062132526": "elbert_memorial",
  "+19857854286": "st_charles_parish",
  "+15058468050": "kirtland_air_force"
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/"))
app.use('/call_logs', serveIndex(__dirname + '/call_logs'));
app.use(express.static('public'))

app.post('/process_call', function (req, res) {
  res.sendStatus(200)
  data = req.body
  let source = numbers[data.Called];
  let url = data.RecordingUrl + ".mp3"
  let dt = dateTime.create();
  let day = dt.format('m_d_Y');
  let downloadOpts = {
    directory: `${call_directory}/${source}`,
    filename: `${day}.mp3`
  }
  download(url, downloadOpts, function(err){
      if (err) throw err
      console.log(`Got ${source}/${downloadOpts.filename}`)
      request.del(data.RecordingUrl, function(e,resp,bod) {
        if(e) {
          console.log(e)
        } else {
          console.log("Deleted twilio original")
        }
      })
  })
})

app.listen(8080, function () {
  console.log('Server up on 8080!')
})
