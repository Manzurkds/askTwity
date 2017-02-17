console.log("bot is starting");


var request = require('request');
var Twit = require('twit');

// var config = require('./config');
var config = {
	consumer_key:         process.env.consumer_key,
	consumer_secret:      process.env.consumer_secret,
	access_token:         process.env.access_token,
	access_token_secret:  process.env.access_token_secret
  // timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
}


var T = new Twit(config);


//Weather Bot

//Setting up a user stream
var stream = T.stream('statuses/filter', { track: '#GetWeather ' });

function onTweet() {
	//Anytime someone tweets me
	stream.on('tweet', tweetEvent);


	function tweetEvent(eventMsg) {
		
		if(eventMsg.user.screen_name != ('ask_twity' || 'AskTwity'))
			weatherTweet();

		function weatherTweet() {
			var status = eventMsg.text;
			var city = status.slice(12, 28);

			var statusId = eventMsg.id;
			var statusIdStr = eventMsg.id_str;
			var replyTo = eventMsg.in_reply_to_screen_name;
			var text = eventMsg.text;
			var from = eventMsg.user.screen_name;

			var condition = '';
			var temp = '';
			var pressure = '';
			var humidity = '';


			request("http://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + process.env.open_weather_API, function(error, response, body) {

				condition = JSON.parse(response.body).weather[0].main;
				// console.log(condition);
				temp = JSON.parse(response.body).main.temp;
				// console.log(temp);
				pressure = JSON.parse(response.body).main.pressure;
				// console.log(pressure);
				humidity = JSON.parse(response.body).main.humidity;
				// console.log(humidity);
				city = JSON.parse(response.body).name;
				// console.log(city);


				tempInCelcius = temp - 273;
				tempInCelcius = tempInCelcius.toFixed(2);
				tempInFarenheit = (tempInCelcius*9)/5 + 32;
				tempInFarenheit = tempInFarenheit.toFixed(2);
				

				var weatherReply = '@' + from + ' Weather in ' + city + ':\n' + condition + '\nTemp: ' + tempInCelcius + ' °C' + tempInFarenheit + ' °F' + '\nPresure: ' + pressure + ' mb\nHumidity: ' + humidity + '%\n#GetWeather'
				console.log(weatherReply);

				tweetIt(weatherReply, statusId, statusIdStr);

		});
		}
	}
}
onTweet();


function tweetIt(text, statusId, statusIdStr) {
	var tweet = {
		in_reply_to_status_id: statusId,
		in_reply_to_status_id_str: statusIdStr,
		status: text
	}
	console.log(tweet);
	T.post('statuses/update', tweet, tweeted);

	function tweeted(err, data, response) {
		if (err) {
			console.log(err);
			console.log(data);
		} else {
			console.log(data);
		}
	}
}
