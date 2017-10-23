console.log("AskTwity has started");


var request = require('request');
var Twit = require('twit');

var debug = false;

if(debug == true) {
    var config = require('./config')
    var weatherKeyword = 'apple'
    var quoteKeyword = 'apple'
    var pnrKeyword = 'apple'
    console.log("running in debug mode")
}
else if(debug == "almost"){
	var config = require('./config')
	var weatherKeyword = '#GetWeather '
	var quoteKeyword = '#RandomQuote'
	var pnrKeyword = '#getPNR'
    console.log("running in almost ready mode")
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
	console.log("running in prod mode")
}


var T = new Twit(config);


var weatherStream = T.stream('statuses/filter', { track: weatherKeyword });
weatherStream.on('tweet', weatherBot);

var quoteStream = T.stream('statuses/filter', { track: quoteKeyword });
quoteStream.on('tweet', quoteBot);

// var pnrStream = T.stream('statuses/filter', { track: pnrKeyword });
// pnrStream.on('tweet', pnrBot);


function tweetIt(text, statusId, statusIdStr) {

	var tweet = {
		in_reply_to_status_id: statusId,
		in_reply_to_status_id_str: statusIdStr,
		status: text
	}
	console.log("Tweet Object is: ", tweet);

	if(debug === false || debug === 'almost') {
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
}

function error(error, statusId, statusIdStr) {
	console.log(error);
	var reply = '@' + from + ' Sorry, there seems to be some error';
		
	tweetIt(reply, statusId, statusIdStr);
}


function weatherBot(eventMsg) {

		let twitterName = eventMsg.user.screen_name;

		if(twitterName != 'AskTwity' && twitterName != 'ask_twity' && twitterName != 'Manzurkds') gotTweet();
		else console.log("It was just me!")

		function gotTweet() {
			var status = eventMsg.text;

			if(debug)
				var city = "Mumbai"
			else 
				var city = status.slice(12, 28); //slices the city after #getweather to use in our request call
				

			var statusId = eventMsg.id;
			var statusIdStr = eventMsg.id_str;
			var from = twitterName;

			var condition = ''
			var temp = ''
			var humidity = ''


			request("http://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + config.open_weather_API, function(error, response, body) {

				if(response)
					processRequest();
				else
					error(error, statusId, statusIdStr);


				function processRequest() {
					
					condition = JSON.parse(response.body).weather[0].main;
					temp = JSON.parse(response.body).main.temp;
					humidity = JSON.parse(response.body).main.humidity;
					city = JSON.parse(response.body).name;


					tempInCelsius = toCelsiusfromKelvin(temp).toFixed(2);
					tempInFarenheit = toFarenheitfromCelsius(tempInCelsius).toFixed(2);
					

					var reply = '@' + from + ' Weather in ' + city + ':\n' + condition + '\nTemp: ' + tempInCelsius + ' °C / ' + tempInFarenheit + ' °F\nHumidity: ' + humidity + '%\n#GetWeather'

					tweetIt(reply, statusId, statusIdStr);


					function toCelsiusfromKelvin(temp) {
						return temp - 273
					} 

					function toFarenheitfromCelsius(temp) {
						return (temp*9/5 + 32)
					}

				}

		});
		}
}



function quoteBot(eventMsg) {

		let twitterName = eventMsg.user.screen_name;
		
		if(twitterName != 'AskTwity' && twitterName != 'ask_twity' && twitterName != 'Manzurkds') gotTweet();
		else console.log("It was just me!")

		function gotTweet() {
			var status = eventMsg.text;

			var statusId = eventMsg.id;
			var statusIdStr = eventMsg.id_str;
			var from = eventMsg.user.screen_name;

			requestCall();


			function requestCall() {
				request("https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1", function(error, response, body) {
					if(body) processRequest();
					else if(error) error(error, statusId, statusIdStr)

				function processRequest() {
					var quote = JSON.parse(body)[0].content;
					quote = quote.replace(/&#8217;/g, "'");
					quote = quote.replace(/&#8216;/g, "'");
					quote = quote.replace(/&#8220;/g, '"');
					quote = quote.replace(/&#8221;/g, '"');
					quote = quote.replace(/&#8211;/g, '_');
					quote = quote.replace(/<[^>]+>/g, '');
					// console.log(quote);
					var author = JSON.parse(body)[0].title;
					// console.log(author)
					var reply = '@' + from + '\n' + quote + '\n— ' + author +'\n#RandomQuote'


					if(reply.length>140)
						requestCall();
					else tweetIt(reply, statusId, statusIdStr);
				}

		});
			}
		}
}





// function pnrBot(eventMsg) {

// 	let twitterName = eventMsg.user.screen_name;
	
// 	if(twitterName != 'AskTwity' && twitterName != 'ask_twity' && twitterName != 'Manzurkds')
// 		gotTweet();

// 	function gotTweet() {
// 		var status = eventMsg.text;

// 		var statusId = eventMsg.id;
// 		var statusIdStr = eventMsg.id_str;
// 		var from = eventMsg.user.screen_name;

// 		var pnr = '';

// 		if(debug)
// 			pnr = '8355016394'

// 		requestCall();


// 		function requestCall() {
// 			var data = {
// 				"X-Mashape-Key": "Sc76wnwIkwmshTWqGn9DGqNw7tvmp1qDC6BjsnQdK4IU3ZdCJZ",
// 				"Accept": "application/json"
// 			}

// 			request.post("https://indianrailways.p.mashape.com/findstations.php?station=delhi", data, function(result) {
// 				console.log(result.status, result.headers, result.body);

// 			function processRequest() {
			
// 				// console.log(quote);
// 				var author = JSON.parse(body)[0].title.slice(0, -1);
// 				// console.log(author)
// 				var reply = '@' + from + '\n' + quote + '\n— ' + author +'\n#RandomQuote'
// 				console.log(reply);


// 				if(reply.length>140)
// 					requestCall();
// 				else tweetIt(reply, statusId, statusIdStr);

// 			}

// 			}, function(error) {
// 				if (error) {
// 					error(error, statusId, statusIdStr)
// 				}
// 			});
// 		}
// 	}
// }