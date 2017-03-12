var fs = require('fs');
var https = require('https');

function downloadRecording(url, path) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, function(resp) {
      if(resp.statusCode !== 200) reject(resp.statusCode)
      const wstream = fs.createWriteStream(path);
      resp.pipe(wstream);
      resp.on('end', resolve);
    });
  });
}

module.exports = {
  downloadRecording
}
