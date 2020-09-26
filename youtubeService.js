var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

var credentials;

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  credentials = JSON.parse(content);
});

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      return callback(oauth2Client);
    }
  });
}

function getNewToken(oauth2Client, callback) {
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
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
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

exports.test = async function(message) {
	authorize(credentials, getLatestVideoPublishedDate)
		.then(response => message.reply(response));
}

async function getLatestVideoPublishedDate(auth){
	return new Promise(function(resolve, reject) {
        var service = google.youtube('v3');
		service.search.list({
			auth: auth,
			part: 'id',
			channelId: "UCoSrY_IQQVpmIRZ9Xf-y93g",
			maxResults: 1,
			order: "date"
		}, function(err, response) {
			if (err) {
				console.log('The API returned an error: ' + err);
				return;
			}
			var lastVideo = response.data.items[0];
			
			console.log(lastVideo['id']['videoId']);
			
			service.videos.list({
				auth: auth,
				part: 'snippet',
				id: lastVideo['id']['videoId']
			}, function(err, response2) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				var snippet = response2.data.items[0];
				return resolve(snippet['publishedAt']);
			});
		});
    })
}