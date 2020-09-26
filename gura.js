const Discord = require('discord.js');
const auth = require('./auth.json');

const _generic 	= require('./genericCommands.js');
const _audio 	= require('./audioCommands.js');
const _image 	= require('./imageCommands.js');
const _text 	= require('./textCommands.js');
const _youtube 	= require('./youtubeService.js');

const fs = require('fs');

const prefix = "a!";
const interactionCooldown = 50;
var   lastInteraction = 0;

const client = new Discord.Client();
client.on("message", function(message) {
	if(message.author.bot) return;

	// Timestamp purposes for logging
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var dateTime = date+' '+time;

	lastInteraction ++;
	
	if(lastInteraction >= interactionCooldown){
		if(Math.floor(Math.random() * 100) == 0){
			message.channel.send(_text.gura());
			lastInteraction = 0;
		}
	}
	
	if(!message.content.startsWith(prefix)) return;
	
	const commandBody = message.content.slice(prefix.length);
	const args = commandBody.split(' ');
	const command = args.shift().toLowerCase();
	
	switch(command){
		case "help": message.reply(_generic.help(prefix)); break;
		
		case "textgura":	
			case "tg": 	
				var strText=_text.gura();
				message.channel.send(strText); 
				fs.appendFile('logs.txt',"["+dateTime+"] TG: " + strText +'\n', function (err) {
					if (err) throw err;
					console.log("["+dateTime+"] TG: " + strText);
				});
				break;

		case "audiogura": case "ag": 	_audio.gura(message, args[0], prefix+command); break;
		
		case "gurafacts":	
			case "gf":
				var strText=_text.facts();
				message.reply(strText); 
				fs.appendFile('logs.txt',"["+dateTime+"] GF: " + strText +'\n', function (err) {
					if (err) throw err;
					console.log("["+dateTime+"] GF: " + strText);
				}); 	
				break;

		case "gurapics": 	case "gp": 	message.channel.send({files: [{attachment: _image.gura(), size: 4096}]}); break;
		//case "getstream": case "gs":
		//case "test": 		_youtube.test(message); break;
		
		default: message.channel.send(_text.gura());
	}
	lastInteraction = 0;
});

client.login(auth.token);