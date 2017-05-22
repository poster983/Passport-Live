//Keep this updated to test every page
var request = require("request");
var assert = require('assert');
var server = require('../bin/www');
var base_url = "http://localhost:3000/"
var r = require('rethinkdb');
var connection = null;
function logger(msg) {
	Console.log(msg);
}
var studentJWTToken = null;
//Setup and Test Database COnnection

describe("Database Connection", function() {
	it("connects to rethinkdb successfully", function() {
		r.connect( {host: 'localhost', port: 28015}, function(err, conn) { //28015
		    assert.equal(null, err);
		    connection = conn;
				done();
		});
	});
});

describe("Create necessary Datastores ", function() {
	//databases
	describe("Create Database", function() {
		it("creates a databaase called \"passport\"", function() {
			r.dbCreate('passport').run(connection, function(err) {
				assert.equal(null, err);
				done();
			});
		});
	});
	//Tables
	describe("Create Tables", function() {
		it("creates a table called \"accounts\"", function() {
			r.db('passport').tableCreate('accounts').run(connection, function(err) {
				console.log(err);
				assert.equal(null, err);
				done();
			});
		});
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
	describe("GET a non existent page", function() {
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
		it("Makes a student account (POST /auth/signup/student)", function() {
			request.post({url:base_url + 'auth/signup/student', form: {email:'example@gmail.com', password:'123456', passwordVer:'123456', firstname:'Testey', lastname:'McTestFace', studentID:'12345'}}, function(err, response, body){
				Console.log("__________");
				Console.log(err);
				console.log(response);
				console.log(body);
				logger(response);
				console.log("__________");
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
				request.post({url:base_url + 'api/auth/login', form: {email:'example@gmail.comhjakfhjk', password:'123456'}}, function(err, response, body){
					assert.equal(200, response.statusCode);
					studentJWTToken = response.token;
					done();
	      });
			});
		});
	});

});
