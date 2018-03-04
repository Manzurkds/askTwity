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
	}

	switch(bot) {
		case bots.weather: 
			weatherBot(eventMsg, twitterName)
			break;
		case bots.quote:
			quoteBot(eventMsg, twitterName)
			break;
		case bots.pnr:
			quoteBot(eventMsg, twitterName)
			break;
	}

}


function tweetIt(text, statusId, statusIdStr) {

	var tweet = {
		in_reply_to_status_id: statusId,
		in_reply_to_status_id_str: statusIdStr,
		status: text
	}
	console.log("Tweet Object is: ", tweet);

	if(config.environment === 'production' || config.environment === 'staging') {
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
	const reply = `@${from} Sorry, there seems to be some error`;
		
	tweetIt(reply, statusId, statusIdStr);
}


function weatherBot(eventMsg, twitterName) {

	var status = eventMsg.text;

	if(config.environment !== 'production')
		var city = "Mumbai"
	else 
		var city = status.slice(12, 28); //slices the city after #getweather to use in our request call
		

	const statusId = eventMsg.id
	const statusIdStr = eventMsg.id_str
	const from = twitterName

	let condition, temp, humidity


	request(`http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${config.open_weather_API}`, function(error, response, body) {

		if(response)
			processRequest();
		else
			error(error, statusId, statusIdStr);


		function processRequest() {
			
			condition = JSON.parse(response.body).weather[0].main;
			temp = JSON.parse(response.body).main.temp;
			humidity = JSON.parse(response.body).main.humidity;
			city = JSON.parse(response.body).name;


			tempInCelsius = helperFunctions.toCelsiusfromKelvin(temp).toFixed(2);
			tempInFarenheit = helperFunctions.toFarenheitfromCelsius(tempInCelsius).toFixed(2);
			

			const reply = `@${from} Weather in ${city}:\n ${condition} \nTemp: ${tempInCelsius} °C / ${tempInFarenheit} °F\nHumidity: ${humidity}% \n#GetWeather`

			tweetIt(reply, statusId, statusIdStr);

		}

	});
}



function quoteBot(eventMsg, twitterName) {

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
			var reply = `@${from} \n${quote} \n— ${author} \n#RandomQuote`


			if(reply.length>140)
				requestCall();
			else tweetIt(reply, statusId, statusIdStr);
		}

	});
	}
}





// function pnrBot(eventMsg, twitterName) {

	
// 	var status = eventMsg.text;

// 	var statusId = eventMsg.id;
// 	var statusIdStr = eventMsg.id_str;
// 	var from = eventMsg.user.screen_name;

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
// 			var reply = '@' + from + '\n' + quote + '\n— ' + author +'\n#RandomQuote'
// 			console.log(reply);


// 			if(reply.length>140)
// 				requestCall();
// 			else tweetIt(reply, statusId, statusIdStr);

// 		}

// 		}, function(error) {
// 			if (error) {
// 				error(error, statusId, statusIdStr)
// 			}
// 		});
// 	}
// }

function setKeywords(weather, quote, pnr) {
	weatherKeyword = weather
	quoteKeyword = quote
	pnrKeyword = pnr
}