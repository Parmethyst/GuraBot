const Discord = require('discord.js');
const https = require('https');

exports.gura = function(){
	const pic = `./img/random/${Math.floor(Math.random() * 21)}.jpg`
	
	return pic;
}

// exports.booru=function() {
// 	console.log("TEST");
// 	let data = '';
// 	let result='';
// 	let offset=Math.floor(Math.random() * 50);
// 	https.get('https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=gawr_gura&limit=1&offset=' + offset, (resp) => {
// 		// A chunk of data has been recieved.
// 		resp.on('data', (chunk) => {
// 			data += chunk;
// 		});

// 		// The whole response has been received. Print out the result.
// 		resp.on('end', () => {
// 			parser = new DOMParser();
// 			result = parser.parseFromString(data,"text/xml");
// 			console.log(result.explanation);
// 		});
// 	}).on("error", (err) => {
// 		console.log("Error: " + err.message);
// 	});
// 	return result.file_url;
// }