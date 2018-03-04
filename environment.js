const environment = 'development';
// development, staging or production

console.log("Running in ", environment)

var config, weatherKeyword, quoteKeyword, pnrKeyword;

if(environment === 'production') {
  config = {
    consumer_key:         process.env.consumer_key,
    consumer_secret:      process.env.consumer_secret,
    access_token:         process.env.access_token,
    access_token_secret:  process.env.access_token_secret,
    open_weather_API: 	  process.env.open_weather_API
  // timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  }
} else {
  config = require('./config');
}

// switch(environment) {
// 	case 'development': 
// 		setKeywords('apple', 'apple', 'apple')
// 		console.log("running in debug mode")
// 		break;
// 	case 'staging':
// 		setKeywords('#GetWeather ', '#RandomQuote', '#getPNR')
// 		console.log("running in almost ready mode")
// 		break;
// 	case 'production':
// 		setKeywords('#GetWeather ', '#RandomQuote', '#getPNR')
// 		console.log("running in prod mode")	
// 		break;
// 	default:
// 		setKeywords('apple', 'apple', 'apple')
// 		console.log("running in debug mode")																		
// }