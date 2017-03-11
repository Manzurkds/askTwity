console.log("AskTwity has started");


var request = require('request');
var Twit = require('twit');

var debug = true;

if(debug) {
    var config = require('./config')
    var weatherKeyword = 'apple'
    var quoteKeyword = 'apple'
    var pnrKeyword = 'apple'
    console.log("running in debug mode")
}
else {
	var config = {
		consumer_key:         process.env.consumer_key,
		consumer_secret:      process.env.consumer_secret,
		access_token:         process.env.access_token,
		access_token_secret:  process.env.access_token_secret,
		open_weather_API: 	  process.env.open_weather_API
  // timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
}
var weatherKeyword = '#GetWeather '
var quoteKeyword = '#RandomQuote'
var pnrKeyword = '#getPNR'
console.log("running in production mode")
}

var T = new Twit(config);




function weatherBot() {
	//Weather Bot

	//Setting up a status's stream
	var stream = T.stream('statuses/filter', { track: weatherKeyword });



	//Anytime someone tweets
	stream.on('tweet', tweetEvent);


	function tweetEvent(eventMsg) {
		
		if(eventMsg.user.screen_name != 'AskTwity' && eventMsg.user.screen_name != 'ask_twity')
			gotTweet();

		function gotTweet() {
			var status = eventMsg.text;

			if(debug)
				var city = "Mumbai"
			else 
				var city = status.slice(12, 28); //slices the city after #getweather to use in our request call
				

			var statusId = eventMsg.id;
			var statusIdStr = eventMsg.id_str;
			var from = eventMsg.user.screen_name;

			var condition = ''
			var temp = ''
			var humidity = ''


			request("http://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + config.open_weather_API, function(error, response, body) {

				if(response)
					processRequest();
				else
					error();



				function processRequest() {
					
					condition = JSON.parse(response.body).weather[0].main;
					// console.log(condition);
					temp = JSON.parse(response.body).main.temp;
					// console.log(temp);
					humidity = JSON.parse(response.body).main.humidity;
					// console.log(humidity);
					city = JSON.parse(response.body).name;
					// console.log(city);


					tempInCelsius = toCelsiusfromKelvin(temp).toFixed(2);
					tempInFarenheit = toFarenheitfromCelsius(tempInCelsius).toFixed(2);
					

					var reply = '@' + from + ' Weather in ' + city + ':\n' + condition + '\nTemp: ' + tempInCelsius + ' °C / ' + tempInFarenheit + ' °F\nHumidity: ' + humidity + '%\n#GetWeather'
					console.log(reply);

					if(!debug)
						tweetIt(reply, statusId, statusIdStr);


					function toCelsiusfromKelvin(temp) {
						return temp - 273
					} 

					function toFarenheitfromCelsius(temp) {
						return (temp*9/5 + 32)
					}

				}

				function error() {
					console.log(error);
					var reply = '@' + from + ' Sorry, there seems to be some error'
					if(!debug)
						tweetIt(reply, statusId, statusIdStr);
				}

		});
		}
	}
}

weatherBot();





function quoteBot() {
	//Quote Bot
	//Setting up a status's stream
	var stream = T.stream('statuses/filter', { track: quoteKeyword });

	//Anytime someone tweets
	stream.on('tweet', tweetEvent);


	function tweetEvent(eventMsg) {

		if(eventMsg.user.screen_name != ('AskTwity' || 'ask_twity'))
			gotTweet();


		function gotTweet() {
			var status = eventMsg.text;

			var statusId = eventMsg.id;
			var statusIdStr = eventMsg.id_str;
			var from = eventMsg.user.screen_name;

			requestCall();


			function requestCall() {
				request("https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1", function(error, response, body) {
					processRequest();

				function processRequest() {
					var quote = JSON.parse(body)[0].content;
					quote = quote.replace(/&#8217;/g, "'");
					quote = quote.replace(/&#8216;/g, "'");
					quote = quote.replace(/&#8220;/g, '"');
					quote = quote.replace(/&#8221;/g, '"');
					quote = quote.replace(/&#8211;/g, '_');
					quote = quote.replace(/<[^>]+>/g, '');
					// console.log(quote);
					var author = JSON.parse(body)[0].title.slice(0, -1);
					// console.log(author)
					var reply = '@' + from + '\n' + quote + '\n— ' + author +'\n#RandomQuote'
					console.log(reply);


					if(reply.length>140)
						requestCall();
					else if(!debug)
						tweetIt(reply, statusId, statusIdStr);

				}

		});
			}
		}
	}
}

quoteBot();





function pnrBot() {
		//PNR Bot
	//Setting up a status's stream
	var stream = T.stream('statuses/filter', { track: pnrKeyword });

	//Anytime someone tweets
	stream.on('tweet', tweetEvent);


	function tweetEvent(eventMsg) {

		if(eventMsg.user.screen_name != ('AskTwity' || 'ask_twity'))
			gotTweet();

		function gotTweet() {
			var status = eventMsg.text;

			var statusId = eventMsg.id;
			var statusIdStr = eventMsg.id_str;
			var from = eventMsg.user.screen_name;

			var pnr = '';

			if(debug)
				pnr = '8355016394'



			requestCall();


			function requestCall() {
				var data = {
					"X-Mashape-Key": "Sc76wnwIkwmshTWqGn9DGqNw7tvmp1qDC6BjsnQdK4IU3ZdCJZ",
					"Accept": "application/json"
				}

				request.post("https://indianrailways.p.mashape.com/findstations.php?station=delhi", data, function(result) {
					console.log(result.status, result.headers, result.body);

				function processRequest() {
				
					// console.log(quote);
					var author = JSON.parse(body)[0].title.slice(0, -1);
					// console.log(author)
					var reply = '@' + from + '\n' + quote + '\n— ' + author +'\n#RandomQuote'
					console.log(reply);


					if(reply.length>140)
						requestCall();
					else if(!debug)
						tweetIt(reply, statusId, statusIdStr);

				}

		});
			}
		}
	}
}

// pnrBot();




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
