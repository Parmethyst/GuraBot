var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

var credentials;
var last_live;

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  credentials = JSON.parse(content);
});

function getAuth(credentials) {
	return new Promise((resolve, reject) => {
		try {
			var clientSecret = credentials.installed.client_secret;
			var clientId = credentials.installed.client_id;
			var redirectUrl = credentials.installed.redirect_uris[0];
			var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

			fs.readFile(TOKEN_PATH, function(err, token) {
				if (err) {
					//arrumar aqui
					getNewToken(oauth2Client);
				} else {
					oauth2Client.credentials = JSON.parse(token);
					resolve(oauth2Client);
				}
			});
		} catch (e) {
			reject(e.message);
		}
	});
}

function getNewToken(oauth2Client) {
	return new Promise((resolve, reject) => {
		var authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES
		});
		console.log('Authorize this app by visiting this url: ', authUrl);
		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question('Enter the code from that page here: ', function(code) {
			rl.close();
			oauth2Client.getToken(code, function(err, token) {
				if (err) {
					console.log('Error while trying to retrieve access token', err);
					reject(err);
				}
				oauth2Client.credentials = token;
				storeToken(token);
				resolve(oauth2Client);
			});
		});
	});
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

function getUpcomingLive(auth){
	return new Promise((resolve, reject) => {
		try {
			var service = google.youtube('v3');
			service.search.list({
				auth: auth,
				part: 'id',
				channelId: "UCoSrY_IQQVpmIRZ9Xf-y93g",
				eventType: "upcoming",
				type: "video",
				maxResults: 1,
				order: "date"
			}, function(err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					reject(err);
				}
				if (response.data.items.length == 0){
					reject("No upcoming lives detected.");
				}

				var nextLive = response.data.items[0];
				if(nextLive == undefined){
					reject("No upcoming lives detected.");
				} else {
					service.videos.list({
						auth: auth,
						part: 'liveStreamingDetails,snippet',
						id: nextLive['id']['videoId']
					}, function(err2, liveDetails) {
						if (err2) {
							console.log('The API returned an error: ' + err2);
							reject(err2);
						}
						var live = liveDetails.data.items[0];
						resolve(live);
					});
				}
			})
		} catch (e) {
			reject(e.message);
		}
	});
}

function formatDateDiff(date1, date2){
	var diff = date2.getTime() - date1.getTime();

	var ms = diff;
	var hh = Math.floor(ms / 1000 / 60 / 60);
	ms -= hh * 1000 * 60 * 60;
	var mm = Math.floor(ms / 1000 / 60);
	ms -= mm * 1000 * 60;
	var ss = Math.floor(ms / 1000);
	ms -= ss * 1000;

	hh = (hh < 10) ? "0"+hh : hh;
	mm = (mm < 10) ? "0"+mm : mm;
	ss = (ss < 10) ? "0"+ss : ss;
	
	return (hh + ":" + mm + ":" + ss);
}

exports.getDateUpcomingLive = function(isAuto) {
	return new Promise((resolve, reject) => {	
		try {
			getAuth(credentials).then(auth=>{
				getUpcomingLive(auth).then(live=>{
					var title 		= live['snippet']['title'];
					var date  		= new Date(live['liveStreamingDetails']['scheduledStartTime']);
					var last_notif	= new Date();
					
					if(last_live != undefined){
						last_notif 	= last_live['liveStreamingDetails']['scheduledStartTime'];
					}
					
					if(last_notif > 1*60*60*1000 || date < 10*60*1000 || !isAuto){
						last_live = live;
						resolve("In "+formatDateDiff(new Date(), date)+" will start a new live! "+title);
					} else {
						reject('Too soon for another notification!');
					}
				}).catch(e=> { reject(e); });
			}).catch(e=> { reject(e); });
		} catch (e) {
			reject(e.message);
		}
	});
}