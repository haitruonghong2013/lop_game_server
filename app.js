var querystring = require('querystring');
var http = exports.http = require('http');
var express = require('express'),
    fs = require('fs');
//var clim = require("clim");
//// Just shadow it
//var console = clim();
//// or monkeypatch it!
//clim(console, true);
var console = require("clim")();

var app = exports.app = express();
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({secret: '1234567890QWERTY'}));
	app.use('/files', express.directory(__dirname + '/'), {icons: true});

// var mysql      = require('mysql');
var pg = exports.pg = require('pg');
// var conString = exports.conString = "postgres://master:12345@localhost/LOP";
var conString = exports.conString = process.env.DATABASE_URL ? process.env.DATABASE_URL : "postgres://master:12345@localhost/LOP";
console.log('connection string ' + conString);
var lopIo = require('./node_modules/LOP_Node.js');

var chars = exports.chars = {};

//var connection = exports.connection = mysql.createConnection({
//  host    : 'localhost',
//  user    : 'master',
// password: '12345'
//});

var pgQuery = exports.pgQuery = function pgQuery(sql, callback)
{
	pg.connect(conString, function(err, client, done)
	{
		if(err)
		{
			callback(err, null);
			return;
		}

		console.log('SQL: ' + sql);
		client.query(sql, function(err, result)
		{
			//call `done()` to release the client back to the pool
			done();

			if(err)
			{
				callback(err, null);
				return;
			}

			callback(err, result);
		});
	});
};

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    console.log('You are not authorized to view this page');
	res.redirect('/login');
  } else {
    next();
  }
};

var setUserIn = exports.setUserIn = function (username, login)
{
	var sql = 'UPDATE character SET online = ' + login + ' WHERE user_id = \'' + username + '\';';

	pgQuery(sql, function(err, result)
	{
		if(err)
		{
			return console.error('error running query', err);
		}
	});
};

setLogIn = exports.setLogIn = function (charName, login)
{
	var sql = 'UPDATE character SET online = ' + login + ' WHERE char_name = \'' + charName + '\';';
	pgQuery(sql, function (error, result)
	{
		if(error)
		{
			console.log(error);
		}
	});
};

checkLogIn = exports.checkLogIn = function (charName, callback)
{
	var sql = 'SELECT online FROM character WHERE char_name = \'' + charName + '\';';
	pgQuery(sql, callback);
};

//connection.connect(function(err) {
//	if(err)
//		throw err;
//	// connected! (unless `err` is set)
//	console.log("database connected!");
//});

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', function(req, res) {
	res.sendfile('./views/index.html');
});

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
// app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
// app.get('/auth/facebook/callback',
//  passport.authenticate('facebook', { successRedirect: '/',
//                                     failureRedirect: '/login' }));

app.get('/login', function(req, res) {
	res.sendfile('./views/login.html');
});

app.get('/contentPage', checkAuth, function(req, res) {
	res.sendfile('./views/contentPage.html');
});

app.get('/logout', function(req, res) {
	if(req.session.user_id)
		setUserIn(req.session.user_id, false);
		delete req.session.user_id;

	res.redirect('/login');
});

// summit score to server
// require lbId, charId, score
app.get('/setwinlose', function(req, res) {
	var username = req.param('username', null);
	var charId = req.param('charId', null);
	var win = req.param('numberWin', 0);
	var lose = req.param('numberLose', 0);

	if(username && charId)
	{
		var sql = 'UPDATE  character SET  win_number = ' + win + ', lose_number = ' + lose +
		' WHERE  user_id = \'' + username + '\' AND  char_name = \''+ charId +'\';';
		pgQuery(sql, function (error, result) {
			if(error)
			{
				console.log(error);
				res.send('2');
			}
			else
			{
				res.send('0' );
			}
		});
	}
	else
	{
		res.send('1');
	}
});

// summit score to server
// require lbId, charId, score
app.get('/submitscore', function(req, res) {
	var lbId = req.param('lbId', null);
	var charId = req.param('charId', null);
	var score = req.param('score', 0);
	if(score < 0)
		score = 0;
	if(lbId&&charId)
	{
		var sql = 'INSERT INTO score ( lb_id, char_name, time_stamp, score ) VALUES ('
			+ '\'' + lbId + '\', \'' + charId + '\', \'' + parseInt(Date.now()/1000) + '\', \''+ score +'\' );';
		pgQuery(sql, function (error, result) {
			if(error)
			{
				console.log(error);
				res.send('2');
			}
			else
			{
				res.send('0' );
			}
		});
	}
	else
	{
		res.send('1');
	}
});

// get list of all users and their password
app.get('/userlist', function(req, res) {
	var sql = 'SELECT username, password FROM lop_user '
			+ 'LIMIT 30';
	pgQuery(sql, function(err, result){
		// There was a error or not?
		if(err != null) {
			console.log(err);
			res.send('1');
		} else {
			// Shows the result on console window
			res.send(result.rows);
		}
	});
});

// get score of top 10 player base on lbId and after
// require lbId, after (in this format 12/31/2012)
app.get('/getscore', function(req, res) {
	var lbId = req.param('lbId', null);
	var afterTimeStamp = req.param('after', null);

	if(lbId&&afterTimeStamp){
		var after = new Date(afterTimeStamp);
		// divide 1000 to get seconds
		var delta = Date.parse(after)/1000;

		// SELECT char_name, score, lv
		// FROM score
		// INNER JOIN character ON char_name = char_name

		// var sql = 'SELECT lb_id, char_name, time_stamp, score FROM  score'
				//+ ' WHERE lb_id = ' + lbId + ' AND time_stamp >= ' + delta
				//+ ' ORDER BY score DESC LIMIT 10';
		var sql = 'SELECT score.char_name, score, lv ' +
			'FROM score INNER JOIN character ON score.char_name = character.char_name ' +
			' WHERE lb_id = \'' + lbId + '\' AND time_stamp >= \'' + delta +
			'\' ORDER BY score DESC LIMIT 10';

		pgQuery(sql, function(err, result){
			// There was a error or not?
			if(err != null) {
				console.log(err);
				res.send('2');
			} else {
				// Shows the result on console window
				res.send(result.rows);
			}
		});
	}
	else
	{
		res.send('1');
	}
});

// get highest score of character
// require lbId, charId
app.get('/myscore', function(req, res) {
	var lbId = req.param('lbId', null);
	var charId = req.param('charId', null);

	if(lbId&&charId){
		 var sql = 'SELECT MAX(score) AS max FROM  score'
				+ ' WHERE lb_id = ' + lbId + ' AND char_name = \'' + charId + '\';';
		pgQuery(sql, function(err, result){
			// There was a error or not?
			if(err != null) {
				console.log(err);
				res.send('2');
			} else {
				// Shows the result on console window
				if(result.rows.length > 0)
					res.send(''+result.rows[0].max);
				else
					res.send('3');
			}
		});
	}
	else
	{
		res.send('1');
	}
});

// get rank of charId base on lbId and after
// require lbId, charId, after (in this format 12/31/2012)
// return Json {"rank":"player rank"}
app.get('/myrank', function(req, res) {
	var lbId = req.param('lbId', null);
	var charId = req.param('charId', null);
	var afterTimeStamp = req.param('after', null);
	var noRank = {'rank':'-1'};

	if(lbId&&afterTimeStamp)
	{
		var after = new Date(afterTimeStamp);
		var delta = Date.parse(after)/1000;
		 var myScoreSql =
		 'SELECT MAX(score) AS max FROM score' +
		 ' WHERE char_name = \'' + charId + '\''
		  + ' AND time_stamp >= ' + delta + ';';
		pgQuery(myScoreSql, function(err, result)
		{
			// There was a error or not?
			if(err != null) {
				console.log(err);
				res.send(noRank);
			} else {
				// Shows the result on console window
				var myScore = result.rows.length == 0 ? -1 : result.rows[0].max;
				if(myScore==null||myScore==-1)
				{
					console.log('score is null or not available');
					res.send(noRank);
					return;
				}
				console.log('my score ' + myScore);
				var sql =
				// DISTINCT
				'SELECT (COUNT(char_name) + 1) AS rank ' +
				'FROM score WHERE lb_id = ' + lbId + ' AND time_stamp >= ' + delta + ' AND ' +
				'score > ' + myScore + ';';
				pgQuery(sql, function(err, result){
					// There was a error or not?
					if(err != null) {
						console.log(err);
						res.send(noRank);
					} else {
						// Send back the rank
						var rank = result.rows.length == 0 ? noRank : result.rows[0];
						res.send(rank);
					}
				});
			}
		});
	}
	else
	{
		res.send(noRank);
	}
});

app.post('/auth', function(req, res) {
	var username = req.param('username', null);
	var password = req.param('password', null);
	if(username && password)
	{
		var sql = 'SELECT user_id, password FROM  lop_user '
			+ 'WHERE user_id = \'' + username + '\' AND password = \'' + password + '\';';

		pgQuery(sql, function(err, result){
			// There was a error or not?
			if(err != null) {
				console.log(err);
				res.send('1');
				return;
			} else {
				// Shows the result on console window
				console.log(result);
			}

			if(result.rows.length == 0)
			{
				res.send( '3' );
			}
			else
			{
				loginOrCreateUser( username, password, function(code){
					if(code==0)
					{
						req.session.user_id	= username;
						chars[username] = result;
						res.send( {'_id':username,'authentication_token':authentication_token} );
					}
					else
					{
						console.log('error while logging in/creating user ' + code);
						res.send( '8' );
					}
				});
			}
		});
	}
	else
	{
		res.send('2' );
	}
});

var checkUserAndToken = function(req, res, next)
{
	var accessToken = req.param('accessToken', null);
	var username = req.param('username', null);

	if(username && accessToken && accessToken != 'null')
	{
		var sql = 'SELECT user_id, password FROM  lop_user '
			+ 'WHERE user_id = \'' + username + '\' AND password = \'' + accessToken +'\';';
		pgQuery(sql, function(err, result){
			if(err)
			{
				console.log(err);
				res.send( '1' );
				return;
			}

			// user not exist
			if(result.rows.length == 0)
			{
				console.log('user not exist ' + username + ' ' + accessToken);
				res.send( '3' );
				return;
			}
			else
			{
				console.log('user existed');
				next();
			}
		});
	}
	else
	{
		console.log('username or access token null');
		res.send( '2' );
	}
}

// call when app first start, create new user and character
// eg:
// http://localhost:5000/updatechar?username=528c2edec2b15ec16c0027a9&accessToken=p7EreavrAV3QDAVJkLUH&charId=DPBB&gold=10000&lv=10&atk1=100&atk2=100&atk3=100&def=80&hp=5000&mp=3500&medal=50000&gender=false&race=0
app.get('/updatechar', checkUserAndToken, function(req, res) {
	var username = req.param('username', null);
	var char_name = req.param('charId', null);
	var gold = req.param('gold', -1);
	var level = req.param('lv', -1);
	var atk1 = req.param('atk1', -1);
	var atk2 = req.param('atk2', -1);
	var atk3 = req.param('atk3', -1);
	var def = req.param('def', -1);
	var hp = req.param('hp', -1);
	var mp = req.param('mp', -1);
	var medal = req.param('medal', -1);
	var char_gender = req.param('gender');
	var char_race = req.param('race', -1);

	if(char_name==null || gold==-1 || level == -1 || atk1 == -1 || atk2 == -1 || atk3 == -1 || def == -1 ||
		hp == -1 || mp == -1 || medal == -1 || typeof char_gender == 'undefined' || char_race == -1)
	{
		console.log('some info are invalid ' + char_name + ' ' +gold+ ' '+level+ ' '+atk1+ ' '+atk2+ ' '+ atk3+ ' ' + def+ ' ' +
		hp + ' '+ mp + ' '+ medal+ ' ' + char_gender+ ' ' + char_race );
		res.send( '9' );
		return;
	}

	var sql3 = 'SELECT char_name FROM character '
	+ 'WHERE char_name = \'' + char_name + '\'';
	pgQuery(sql3, function (error, result)
	{
		if(error)
		{
			console.log(error);
			res.send( '5' );
			return;
		}

		// char exist
		if(result.rows.length != 0)
		{
			// user creation/check done, update character
			var sql4 = 'UPDATE character SET '+
			' gold = ' + gold +
			' ,lv = ' + level +
			' ,atk1 = ' + atk1 +
			' ,atk2 = ' + atk2 +
			' ,atk3 = ' + atk3 +
			' ,def = ' + def +
			' ,hp = ' + hp +
			' ,mp = ' + mp +
			' ,medal = ' + medal +
			' ,char_gender = ' + char_gender +
			' ,char_race = ' + char_race +
			' WHERE user_id = \'' + username + '\' AND char_name = \'' + char_name + '\';';
			pgQuery(sql4, function (error, result) {
				if(error)
				{
					console.log(error);
					res.send( '7' );
					return;
				}

				console.log('update char successed');
				res.send( '0' );
			});
		}
		else
		{
			console.log('char not existed ' + char_name);
			res.send( '4' );
			return;
		}
	});
});

// call when app first start, create new user and character
// eg:
// http://localhost:5000/newchar?username=528c2edec2b15ec16c0027a9&accessToken=p7EreavrAV3QDAVJkLUH&charId=DPBB
app.get('/newchar', checkUserAndToken, function(req, res) {
	var username = req.param('username', null);
	var char_name = req.param('charId', null);
	var gold = 0;
	var level = 1;
	var atk1 = 6.8;
	var atk2 = 10.9;
	var atk3 = 6.8;
	var def = 4.7;
	var hp = 600;
	var mp = 550;
	var medal = 0;
	var char_gender = req.param('gender', false);
	var char_race = req.param('race', 0);

	var sql3 = 'SELECT char_name, ban FROM  character '
	+ 'WHERE char_name = \'' + char_name + '\';';
	pgQuery(sql3, function (error, result)
	{
		if(error)
		{
			console.log(error);
			res.send( '5' );
			return;
		}

		// char not exist
		if(result.rows.length == 0)
		{
			// user creation/check done, create character
			var sql4 = 'INSERT INTO character '+
			'(user_id, char_name, gold, lv, atk1, atk2, atk3, def, hp, mp, medal, char_gender, char_race, online , ban, win_number, lose_number) ' +
			'VALUES (\'' + username + '\', \'' + char_name + '\',  ' + gold + ',  ' + level + ',  ' + atk1 + ',  ' + atk2 + ',  ' + atk3 + ',  ' +
			def + ',  ' + hp + ',  ' + mp + ',  ' + medal + ',  ' + char_gender + ',  ' + char_race + ',  ' + false + ',  ' + false +',  ' + 0 + ',  ' + 0 +');';
			pgQuery(sql4, function (error, result) {
				if(error)
				{
					console.log(error);
					res.send( '7' );
					return;
				}

				console.log('new char successed');
				res.send( '0' );
			});
		}
		else
		{
			res.send( '4' );
			console.log('char existed ' + char_name);
			return;
		}
	});
});

// call when app first start, create new user and character
// eg:
// http://localhost:5000/delchar?username=528c2edec2b15ec16c0027a9&accessToken=p7EreavrAV3QDAVJkLUH&charId=abc
app.get('/delchar', checkUserAndToken, function(req, res) {
	var char_name = req.param('charId', null);

	var sql3 = 'DELETE FROM char_name ' +
		'WHERE char_name = \'' + char_name + '\';';
	pgQuery(sql3, function (error, result) {
		if(error)
		{
			console.log(error);
			res.send( '5' );
			return;
		}

		console.log('del char successed');
		res.send( '0' );
	});
});

// call when app first start, create new user and character
// eg:
// http://localhost:5000/getchar?username=528c2edec2b15ec16c0027a9&accessToken=p7EreavrAV3QDAVJkLUH&charId=abc
app.get('/getchar', checkUserAndToken, function(req, res) {
	var char_name = req.param('charId', null);

	var sql3 = 'SELECT char_name, gold, lv, atk1, atk2, atk3, def, hp, mp, medal ' +
			'FROM character WHERE char_name = \'' + char_name + '\'';
	pgQuery(sql3, function (error, result) {
		if(error)
		{
			console.log(error);
			res.send( '5' );
			return;
		}

		// char not exist
		if(result.rows.length == 0)
		{
			res.send( '4' );
			console.log('char existed ' + char_name);
			return;
		}
		else
		{
			console.log('get char successed');
			res.send( result.rows );
		}
	});
});

var loginOrCreateUser = function(username, password, callback)
{
	console.log('querrying');
	if(username && password)
	{
		var sql = 'SELECT user_id FROM  lop_user '
			+ 'WHERE user_id = \'' + username + '\'';
		pgQuery(sql, function(err, result){
			if(err)
			{
				console.log(err);
				callback(1);
				return;
			}

			if(result.rows.length == 0)
			{
				var sql2 = 'INSERT INTO lop_user ( user_id , password ) VALUES (' + "'" + username +"'" +',' + "'"+ password +"'" +');';
				pgQuery(sql2, function (error, result) {
					if(error)
					{
						console.log(error);
						callback(3);
						return;
					}

					callback(0);
					return;
				});
			}
			else
			{
				var sql2 = 'UPDATE lop_user SET password = \'' + password + '\' WHERE user_id = \'' + username + '\';';
				pgQuery(sql2, function (error, result) {
					if(error)
					{
						console.log(error);
						callback(4);
						return;
					}

					callback(0);
					return;
				});
			}
		});
	}
	else
	{
		callback(2);
		return;
	}
}

// call when app first start, create new user and character
// eg:
// http://localhost:5000/authfb?token=CAAGZAvfspq08BANhzngSa2ZBPBwAq4MIZACYd47EZC74zXpQjATnNdZBbgoUdnMgkal52wke55pZBeRNZAwWTq55NcY9Gv8ZAbBb2L9wnrrnBXwLB17ScI7KBngkGFLd4QLlFcEBwr9oVj0iVf9xaGGFqRHYqpeaMQbeSALltWb7gTrXAbApPAtV&facebook_id=100000198194432&name=Anh%20Tung%20Hoang&email=tungbeng2006@gmail.com&birthday=06\/20\/1990&sex=male&address=Hanoi,%20Vietnam
app.get('/authfb', function(req, res) {
	var token = req.param('token', null);
	var facebook_id = req.param('facebook_id', null);
	var name = req.param('name', null);
	var email = req.param('email', null);
	var birthday = req.param('birthday', null);
	var sex = req.param('sex', null);
	var address = req.param('address', null);

	var post_data = querystring.stringify({
		'token' : token,
		'facebook_id': facebook_id,
		'name': name,
		'email' : email,
		'birthday' : birthday,
		'sex' : sex,
		'address' : address
	});

	var options = {
		hostname: 'ws.uboxapp.com',
		path: '/oauth/facebook_normal.json/',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};

	var postReq = http.request(options, function(postRes) {
		postRes.setEncoding('utf8');
		var str = '';
		postRes.on('data', function (chunk) {
			str += chunk;
		});

		postRes.on('end', function () {
			console.log('Total data: ' + str);
			var result = JSON.parse(str);
			var username = result._id;
			var authentication_token = result.authentication_token;

			console.log('logging in');
			loginOrCreateUser( username, authentication_token, function(code){
				if(code==0)
				{
					req.session.user_id	= username;

					chars[username] = result;

					//req.on("close", function()
					//{
					//	console.log('connection from ' + username + ' closed');
					//	loginOrCreateUser( username, '', function(code){});
					//	delete req.session.user_id;
					//	delete chars[username];
					//});

					//req.on("end", function()
					//{
					//	console.log('connection from ' + username + ' ended');
					//	loginOrCreateUser( username, '', function(code){});
					//	delete req.session.user_id;
					//	delete chars[username];
					//});
					res.send( {'_id':username,'authentication_token':authentication_token} );
				}
				else
				{
					console.log('error while logging in/creating user ' + code);
					res.send( '8' );
				}
			});
		});

		postRes.on('error',function(e){
			console.log("Error: " + e.message);
			res.send( '6' );
		});
	});

	postReq.on('error', function(e) {
		console.log('problem with request: ' + e.message);
		res.send( '7' );
	});

	// write parameters to post body
	postReq.write(post_data);
	postReq.end();
});

app.post('/regisnew', function(req, res) {
	var username = req.param('username', null);
	var password = req.param('password', null);
	var password2 = req.param('password2', null);

	if(username && password && password2 && password == password2)
	{
		var sql = 'SELECT user_id FROM  lop_user '
			+ 'WHERE user_id = \'' + username + '\'';

		pgQuery(sql, function(err, result){
			if(err)
			{
				res.send('database error ' + err);
				return;
			}
			if(result.rows.length == 0)
			{
				var sql2 = 'INSERT INTO lop_user ( user_id , password ) VALUES (' + "'" + username +"'" +',' + "'"+ password +"'" +');';
				pgQuery(sql2, function (error, result) {
					if(err)
					{
						res.send('database error ' + error);
						return;
					}
					console.log('password ' + password);
					res.send('Registration successed, hello ' + username );
		      });
			}
			else
			{
				res.send('User name existed, ' + username );
			}
		});
	}
	else
	{
		res.send('Wrong password' );
	}
});

app.get('/quit', function(req, res)
{
	var username = req.param('username', null);
	if(username)
	{
		console.log('connection from ' + username + ' ended');
		loginOrCreateUser( username, 'null', function(code){});
		delete req.session.user_id;
		delete chars[username];
		res.send('0');
	}
	res.send('1');
});

app.get('/regis', function(req, res) {
	res.sendfile('./views/regis.html');
});

app.get('/*', function(req, res) {
	var fullURL = req.protocol + "://" + req.get('host') + req.url;
	res.send('404, page not found ' + fullURL);
});

// app.listen(3000);