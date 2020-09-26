const Discord = require('discord.js');

exports.gura = function(){
	const pic = `./img/random/${Math.floor(Math.random() * 21)}.jpg`
	
	return pic;
}