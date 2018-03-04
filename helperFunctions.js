const toCelsiusfromKelvin = function (temp) {
    return temp - 273
} 

const toFarenheitfromCelsius = function(temp) {
    return (temp*9/5 + 32)
}

module.exports = {
    toCelsiusfromKelvin: toCelsiusfromKelvin,
    toFarenheitfromCelsius: toFarenheitfromCelsius
}