# Menu Caller

A lot of places likes hospitals and military bases have a number you can call that allows you to hear a real human being read the food that place is serving that day. There's a subtle and beautiful art to it, I swear. This service uses the Twilio API to automatically call a handful of the greatest ones (curated by endless pal [Andy Sturdevant](http://www.andysturdevant.com/)), record the output, and pull the recordings down to the server of your choice.

1. `cp keys.js.sample keys.js`
2. In keys.js, fill in in the values provided by your Twilio account, as well as the absolute URL you'll be posting to and the absolute URL that call.xml (a brief file that essentially tells Twilio's robot caller to [shut up and listen](https://www.youtube.com/watch?v=MdCRcrgX080)). Twilio only takes absolute URLs for some reason.
3. `npm install`
4. `node index.js`
5. `node ahoy.js`
