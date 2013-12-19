var pg = require('pg'); 
//or native libpq bindings
//var pg = require('pg').native

var conString = "postgres://master:12345@localhost/LOP";

var username = 'master5';
var password = '12345';  
var insertSql = 'INSERT INTO \"lop_user\" ( user_id , password ) VALUES (' + "'" + username +"'" +',' + "'"+ password +"'" +');';

function pgQuerry(sql, callback)
{
	pg.connect(conString, function(err, client, done) {
	if(err)
	{
		callback(err, null);
	}

	console.log('SQL: ' + sql);
	client.query(sql, function(err, result) {
			//call `done()` to release the client back to the pool
			done();

			if(err) 
			{
				callback(err, null);
			}		

			callback(err, result);
		});
	});
}

pgQuerry(insertSql, function(err, result)
{
	if(err) 
	{
		console.error('error while querrying ', err);
    }	
	else
	{
		console.log('querrying success ');
	}
});

//pg.connect(conString, function(err, client, done) {
//  if(err) {
//    return console.error('error fetching client from pool', err);
//  }
//  
//  
//  client.query(sql, function(err, result) {
//    //call `done()` to release the client back to the pool
//    done();
//
//    if(err) {
//      return console.error('error running query', err);
//    }
//
//	console.log('password ' + password);
//	return console.log('Registration successed, hello ' + username );	
//  });
//});