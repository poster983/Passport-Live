//Keep this updated to test every page
var request = require("request");
var assert = require('assert');
var server = require('../bin/www');
var base_url = "http://localhost:3000/"
var r = require('rethinkdb');
var config = require('config');
var connection = null;
function logger(msg) {
	Console.log(msg);
}
var studentJWTToken = null;

//Check if NOT using "tests" envirement variable.  Exits if true
if(config.util.getEnv('NODE_ENV') != "tests") {
	console.error("MUST PASS \"NODE_ENV=tests\" WHEN RUNNING.  \n  You Passed: " + config.util.getEnv('NODE_ENV'));
	process.exit(1);
}


/** 
MAIN PROGRAM
**/
describe("MAIN PASSPORT PROGRAM", function() {


	//Setup and Test Database COnnection BEFORE 
	
	before(function(done){
		var p = r.connect( {host: config.get('rethinkdb.host'), port: config.get('rethinkdb.port')}, function(err, conn) {
			if (err) throw err;
    		connection = conn;
    	});
		p.then(function(conn) {
		   r.dbCreate(config.get('rethinkdb.database')).run(connection, function() {
			   	r.db(config.get('rethinkdb.database')).tableCreate('accounts').run(connection, function(err) {
			   		if (err) throw err;
			   		done();
			   	});
		   });
		});
	});
	//cleanup
	after(function() {
		r.dbDrop(config.get('rethinkdb.database')).run(connection, function(err){
			if (err) throw err;
		});
	});

	// Test if server is running normaly
	describe("Server Test", function(){
		describe("GET /", function() {
			it("returns status code 200 Continue", function() {
				request.get(base_url, function(error, response, body) {
					assert.equal(103, response.statusCode);
					done();
	      });
	    });
			it("returns status code 302 Found (Redirect)", function() {
				request.get(base_url, function(error, response, body) {
					assert.equal(302, response.statusCode);
					done();
	      });
	    });

	  });
		describe("GET /auth/login", function() {
			it("returns status code 200 Continue", function() {
				request.get(base_url+"auth/login", function(error, response, body) {
					assert.equal(200, response.statusCode);

					done();
	      });
	    });
	  });
		context("When a page is not found", function() {
			it("returns status code of 404 Not Found", function() {
				request.get(base_url+"thisshouldneverbefound/ever", function(error, response, body) {
					assert.equal(404, response.statusCode);
					done();
	      		});
			})
		});
	});


	//Auth Testing
	describe("Auth Tests", function() {

		/**
		STUDENT Signup
		**/
		describe("Signup As Student", function() {
			//Gets student signup page
			it("Gets Signup Page (GET /auth/signup/student)", function(){
				request.get(base_url+"auth/signup/student", function(error, response, body) {
					assert.equal(200, response.statusCode);
					done();
	      		});
			});
			//Tries to make an account
			it("Makes a student account (POST /auth/signup/student) and returnes 201 Created", function() {
				request.post({url:base_url + 'auth/signup/student', form: {email:'example@gmail.com', password:'123456', passwordVer:'123456', firstname:'Testey', lastname:'McTestFace', studentID:'12345'}}, function(err, response, body){
					
					assert.equal(201, response.statusCode);
					done();
				});
			});
		});
	});


	/**
	API Tests
	**/
	describe("REST API Tests" , function() {
		//Generic Tests
		describe("Default Route for /api/", function() {
			it("returns status code 418 I'm a teapot ", function() {
				request.get(base_url+"api", function(error, response, body) {
					assert.equal(418, response.statusCode);
					done();
	      		});
			});
		});

		//Auth Tests
		describe("API Auth Tests", function() {
			describe("Login /api/auth/login", function() {
				it("returns http status code 200, and a response JWT", function() {
					request.post({url:base_url + 'api/auth/login', form: {email:'example@gmail.com', password:'123456'}}, function(err, response, body){
						assert.equal(200, response.statusCode);
						studentJWTToken = response.token;
						done();
		      		});
				});
			});
		});

	});

});