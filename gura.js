const Discord = require('discord.js');
const auth = require('./auth.json');

const _generic 	= require('./genericCommands.js');
const _audio 	= require('./audioCommands.js');
const _image 	= require('./imageCommands.js');
const _text 	= require('./textCommands.js');
const _youtube 	= require('./youtubeService.js');

const fs = require('fs');

const prefix = "a.";
const interactionCooldown = 50;
var   lastInteraction = 0;

var notifChannel = null;

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
		
		case "guratext":	
			case "gt": 	
				var strText=_text.gura();
				message.channel.send(strText); 
				fs.appendFile('logs.txt',"["+dateTime+"] TG: " + strText +'\n', function (err) {
					if (err) throw err;
					console.log("["+dateTime+"] TG: " + strText);
				});
				break;

		case "guraaudio": 
			case "ga": 	
				_audio.gura(message, args[0], prefix+command); 
				break;
				
		case "gurafacts":	
			case "gf":
				var strText=_text.facts();
				message.reply(strText); 
				fs.appendFile('logs.txt',"["+dateTime+"] GF: " + strText +'\n', function (err) {
					if (err) throw err;
					console.log("["+dateTime+"] GF: " + strText);
				}); 	
				break;
				
		case "guraclip":	
			case "gc": 	
				var strText=_text.clips();
				message.channel.send(strText); 
				fs.appendFile('logs.txt',"["+dateTime+"] GC: " + strText +'\n', function (err) {
					if (err) throw err;
					console.log("["+dateTime+"] GC: " + strText);
				});
				break;
				
		case "gurabooru":	
			case "gb": 	
				_image.booru().then(response=>{
					console.log(response);
					var strText = "https://safebooru.org/images/" + response.directory + "/" + response.image;
					message.channel.send(strText);
					fs.appendFile('logs.txt',"["+dateTime+"] GB: " + strText +'\n', function (err) {
						if (err) throw err;
						console.log("["+dateTime+"] GB: " + strText);
					});
				}).catch(error=>{ console.log(error); });
				break;
				
		case "gurapics": 	
			case "gp": 	
				message.channel.send({files: [{attachment: _image.gura(), size: 4096}]}); 
				break;
		//case "getstream": case "gs":
		
		case "setchannel":
			case "sc":
				notifChannel = message.channel;
				message.reply("Okay, this channel will start receiving notifications");
				break;
		
		case "nextlive":
			case "nl":
				_youtube.getDateUpcomingLive(false).then(response=>{
					message.reply(response);
				}).catch(error=>{ 
					if(error == "No upcoming lives detected.")
						message.reply(error);
					else
						console.log(error);
				});
				break;
		
		default: message.channel.send(_text.gura());
	}
	lastInteraction = 0;
});

function autoNotif() {
	if(notifChannel != null){
		_youtube.getDateUpcomingLive(true).then(response=>{
			notifChannel.send(response);
		}).catch(error=>{ console.log(error); });
	}
}

setInterval(autoNotif, 10*60*1000);
client.login(auth.token);