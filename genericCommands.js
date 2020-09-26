const Discord = require('discord.js');

exports.help = function(prefix){
	const attachment = new Discord.MessageAttachment('./img/guraart.jpg');
	var help_msg = new Discord.MessageEmbed()
		.setColor(`#006994`)
		.attachFiles(attachment)
		.setThumbnail(`attachment://guraart.jpg`)
		.setTitle(`GuraBot Helper!`)
		.setDescription(`This bot was made by a humble shrimp. Please support Gawr Gura!`)
		.addField(	`Commands`, `
					${prefix}TextGura 	(${prefix}tg): Reply you with an iconic Gura quote;
					${prefix}AudioGura 	(${prefix}ag): Gura joins the vc, she has something to say;
					${prefix}GuraFacts	(${prefix}gf): Are you ready for some random ocean facts?;
					${prefix}GuraPics	(${prefix}gp): Cute pics of best shork;`)
	return help_msg;
}

