const environment = 'development';
// development, staging or production

console.log("Running in ", environment)

var config;

if(environment === 'production') {
  config = {
    environment:          environment,
    consumer_key:         process.env.consumer_key,
    consumer_secret:      process.env.consumer_secret,
    access_token:         process.env.access_token,
    access_token_secret:  process.env.access_token_secret,
    open_weather_API: 	  process.env.open_weather_API
  // timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  }
} else {
  config = require('./devConfig');
}

module.exports = config

