// load the express package and create our app
var express = require('express');
const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config({ path: './config.env' });
var app = express();
const PORT = process.env.PORT || 8080;
const DBPASS = process.env.DBPASS;
// set the port based on environment (more on environments later)
var port = PORT;
const DBURI = process.env.DBURI || "mongodb://127.0.0.1:27017"

const MongoClient = require('mongodb').MongoClient;

const uri = DBURI;

app.route('/signup')
    .get(function(req, res) {       
    	var output = 'getting the login! ';
    	var username = req.query.username;
    	var password = req.query.password;
    	if (typeof username != 'undefined' && typeof password != 'undefined') {
        	output+=('There was input');
     	}
     	console.log(username+" "+password);
     	console.log('Start the database stuff');

     	MongoClient.connect(uri, function (err, db) {
            if(err) throw err;
            console.log('Start the database stuff');

            //Write databse Insert/Update/Query code here..
            var dbo = db.db("mydb");

            hash = crypto.createHash('sha256');
            password = hash.update(password).digest('hex')

            var userField = { username: username, password: password };

            dbo.collection("users").findOne({username: username}).then(user => {
            	if (user) {
            		res.send("Username already registered, try another one (or login if it's you)");
            	} else {
            		dbo.collection("users").insertOne(userField, function(err, res) {
        	    		if (err) throw err;
            			console.log("1 user inserted");
              			console.log(DBURI);
              			db.close();
            		});
            	}
            });

            console.log('End the database stuff');
     	});
   	})

  	// process the form (POST http://localhost:PORT/login)
    .post(function(req, res) { console.log('processing');
    	res.send('processing the login form!');
  	});

app.route('/login')
	.get(function(req, res) {       
    	var output = 'getting the login! ';
    	var username = req.query.username;
    	var password = req.query.password;
    	if (typeof username != 'undefined' && typeof password != 'undefined') {
        	output+=('There was input');
     	}
     	console.log(username+" "+password);
     	console.log('Start the database stuff');

     	MongoClient.connect(uri, function (err, db) {
            if(err) throw err;
            console.log('Start the database stuff');

            //Write databse Insert/Update/Query code here..
            var dbo = db.db("mydb");

            hash = crypto.createHash('sha256');
            password = hash.update(password).digest('hex')

            var userField = { username: username, password: password };

            dbo.collection("users").findOne({username: username}).then(user => {
            	if (user) {
            		dbo.collection("users").findOne({password: password}).then(password => {
            			if (password) {
            				res.send("Login confirmed!")
            			} else {
            				res.send("Account/Password combination invalid.");
            			}
            		});
            	} else {
            		res.send("Account/Password combination invalid.");
            	}
            });

            console.log('End the database stuff');
     	});
   	})

  	// process the form (POST http://localhost:PORT/login)
    .post(function(req, res) { console.log('processing');
    	res.send('processing the login form!');
  	});

// send our index.html file to the user for the home page
app.get('/signup.html', function(req, res) {
	res.sendFile(__dirname + '/signup.html');
});

app.get('/login.html', function(req, res) {
	res.sendFile(__dirname + '/login.html');
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

// create routes for the admin section
//get an instance of the router
var adminRouter = express.Router();

adminRouter.use(function(req, res, next) {
	// log each request to the console
	console.log(req.method, req.url);
	// continue doing what we were doing and go to the route
	next(); 
});

// route middleware to validate :name
adminRouter.param('name', function(req, res, next, name) {
	// do validation on name here
	// log something so we know its working
	console.log('doing name validations on ' + name);
	// once validation is done save the new item in the req
	req.name = name;
	// go to the next thing
	next();
});



// admin main page. the dashboard (http://localhost:PORT/admin)
adminRouter.get('/', function(req, res) {
	res.send('I am the dashboard!'); 
});

// users page (http://localhost:PORT/admin/users)
adminRouter.get('/users', function(req, res) {
	res.sendFile(__dirname + '/users.html'); 
});

// users name page
adminRouter.get('/users/:name', function(req, res) {
	res.send('hello ' + req.params.name + '!'); 
});

// posts page (http://localhost:PORT/admin/posts)
adminRouter.get('/posts', function(req, res) {
	res.send(__dirname + '/posts.html'); 
});

// apply the routes to our application
app.use('/admin', adminRouter);

// start the server
app.listen(PORT);
console.log('Express Server running at http://127.0.0.1:'.PORT);