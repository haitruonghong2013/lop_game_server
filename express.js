querystring = require('querystring');
var express = require('express');
var http = require('http');
var app = express();
 
var post_data = querystring.stringify({
  'token' : 'CAAGZAvfspq08BANhzngSa2ZBPBwAq4MIZACYd47EZC74zXpQjATnNdZBbgoUdnMgkal52wke55pZBeRNZAwWTq55NcY9Gv8ZAbBb2L9wnrrnBXwLB17ScI7KBngkGFLd4QLlFcEBwr9oVj0iVf9xaGGFqRHYqpeaMQbeSALltWb7gTrXAbApPAtV',
  'facebook_id': '100000198194432',
  'name': 'Anh Tung Hoang',
	'email' : 'tungbeng2006@gmail.com',
	'birthday' : '06\/20\/1990' ,
	'sex' : 'male',
	'address' : 'Hanoi, Vietnam'
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

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  var str = '';
  res.on('data', function (chunk) {
	str += chunk;
  });
  
  res.on('end', function () {
    console.log('1, Total data: ' + str);	
	var result = JSON.parse(str);
	console.log('hello ' + result.name);
  });
  
  res.on('error',function(e){
   console.log("Error: " + hostNames[i] + "\n" + e.message); 
   console.log( e.stack );
});
});

req.on('error', function(e) {
  console.log('2, problem with request: ' + e.message);  
   console.log( e.stack );
});

// write parameters to post body  
req.write(post_data); 
req.end();
 
app.listen(process.env.PORT || 5000);