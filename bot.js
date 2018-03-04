console.log("AskTwity has started");
const request = require('request')
const Twit = require('twit')
const config = require('./config')
const helperFunctions = require('./helperFunctions')

var weatherKeyword, quoteKeyword, pnrKeyword
if(config.environment === 'production' || config.environment === 'staging') {
	setKeywords('#GetWeather ', '#RandomQuote', '#getPNR')
} else {
	setKeywords('apple', 'apple', 'apple')
}

const T = new Twit(config);

const bots = {
	weather: 'weatherBot',
	quote: 'quoteBot',
	pnr: 'pnrBot'
}

let previousTwitter;

const weatherStream = T.stream('statuses/filter', { track: weatherKeyword });
weatherStream.on('tweet', (event) => {
	onTweetReceive(event, bots.weather)
});

const quoteStream = T.stream('statuses/filter', { track: quoteKeyword });
quoteStream.on('tweet', (event) => {
	onTweetReceive(event, bots.quote)
});

// const pnrStream = T.stream('statuses/filter', { track: pnrKeyword });
// pnrStream.on('tweet', (event) => {
// 	onTweetReceive(event, bots.pnr)
// });


function onTweetReceive(eventMsg, bot) {

	let twitterName = eventMsg.user.screen_name;

	if(!(twitterName != 'AskTwity' && twitterName != 'ask_twity' && twitterName != 'Manzurkds')) {
		console.log("It was just me")
		return
	} else if(twitterName === previousTwitter) {
		console.log("Oops someone is replicating you!")
		return
	}

	previousTwitter = twitterName

	const details = {
		from: twitterName,
		statusId: eventMsg.id,
		statusIdStr: eventMsg.id_str,
		status: eventMsg.text
	}

	switch(bot) {
		case bots.weather: 
			weatherBot(eventMsg, details)
			break;
		case bots.quote:
			quoteBot(eventMsg, details)
			break;
		case bots.pnr:
			quoteBot(eventMsg, details)
			break;
	}

}


function sendTweet(text, statusId, statusIdStr) {

	var tweet = {
		in_reply_to_status_id: statusId,
		in_reply_to_status_id_str: statusIdStr,
		status: text
	}
	console.log("Tweet Object to be send: ", tweet);

	if(config.environment === 'production' || config.environment === 'staging') {
		T.post('statuses/update', tweet, (err, data, response) => {
			if (err) {
				console.log(err);
				console.log(data);
			} else {
				console.log(data);
			}
		});
	}
}


function weatherBot(eventMsg, tweetObject) {

	if(config.environment !== 'production')
		var city = "Mumbai"
	else 
		var city = status.slice(12, 28); //slices the city after #getweather to use in our request call
	

	let condition, temp, humidity

	request(`http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${config.open_weather_API}`, function(err, response, body) {

		if (err) {
			const reply = `@${tweetObject.from} Sorry, there seems to be some error`;
			sendTweet(reply, tweetObject.statusId, tweetObject.statusIdStr);
		}
		else {
			condition = JSON.parse(response.body).weather[0].main;
			temp = JSON.parse(response.body).main.temp;
			humidity = JSON.parse(response.body).main.humidity;
			city = JSON.parse(response.body).name;


			tempInCelsius = helperFunctions.toCelsiusfromKelvin(temp).toFixed(2);
			tempInFarenheit = helperFunctions.toFarenheitfromCelsius(tempInCelsius).toFixed(2);
			

			const reply = `@${tweetObject.from} Weather in ${city}:\n ${condition} \nTemp: ${tempInCelsius} °C / ${tempInFarenheit} °F\nHumidity: ${humidity}% \n#GetWeather`

			sendTweet(reply, tweetObject.statusId, tweetObject.statusIdStr);
			clearPreviousTwitter()
		}

	});
}



function quoteBot(eventMsg, tweetObject) {

	requestCall();

	let retry = 0

	function requestCall() {
		request("https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1", function(err, response, body) {
			if(err) {
				if(retry < 5) {
					retry++
					requestCall()
				}
			}
			else {
				let quote = JSON.parse(body)[0].content;
				quote = quote.replace(/&#8217;|&#8216;|&#8220;|&#8221;|&#8211;/g, "'").replace(/<[^>]+>/g, '');
				// console.log(quote);
				const author = JSON.parse(body)[0].title;
				// console.log(author)
				const reply = `@${tweetObject.from} \n${quote}— ${author} \n\n#RandomQuote`


				if(reply.length>140) requestCall()
				else {
					sendTweet(reply, tweetObject.statusId, tweetObject.statusIdStr);
					clearPreviousTwitter()
				}
			}
	});
	}
}





// function pnrBot(eventMsg, tweetObject) {

// 	var pnr = '';

// 	if(debug)
// 		pnr = '8355016394'

// 	requestCall();


// 	function requestCall() {
// 		var data = {
// 			"X-Mashape-Key": "Sc76wnwIkwmshTWqGn9DGqNw7tvmp1qDC6BjsnQdK4IU3ZdCJZ",
// 			"Accept": "application/json"
// 		}

// 		request.post("https://indianrailways.p.mashape.com/findstations.php?station=delhi", data, function(result) {
// 			console.log(result.status, result.headers, result.body);

// 		function processRequest() {
		
// 			// console.log(quote);
// 			var author = JSON.parse(body)[0].title.slice(0, -1);
// 			// console.log(author)
// 			var reply = '@' + tweetObject.from + '\n' + quote + '\n— ' + author +'\n#RandomQuote'
// 			console.log(reply);


// 			if(reply.length>140)
// 				requestCall();
// 			else {
//				sendTweet(reply, tweetObject.statusId, tweetObject.statusIdStr);
//				clearPreviousTwitter()
//			}

// 		}

// 		}, function(err) {
// 			if (err) {
//              const reply = `@${tweetObject.from} Sorry, there seems to be some error`;
// 				sendTweet(reply, tweetObject.statusId, tweetObject.statusIdStr);
// 			}
// 		});
// 	}
// }


function clearPreviousTwitter() {
	setTimeout(() => {
		previousTwitter = ''
	}, 4000)
}

function setKeywords(weather, quote, pnr) {
	weatherKeyword = weather
	quoteKeyword = quote
	pnrKeyword = pnr
}