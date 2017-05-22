//Keep this updated to test every page
var request = require("request");
var assert = require('assert');
var server = require('../bin/www');
var base_url = "http://localhost:3000/"
var r = require('rethinkdb');
var connection = null;
//Setup and Test Database COnnection

describe("Database Connection", function() {
	it("connects to rethinkdb successfully", function() {
		r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
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




// Test if server is
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
});
//Auth Testing
describe("Auth Tests", function() {
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
				console.log("__________");
				console.log(err);
				console.log(response);
				console.log(body);
				describe(response);
				console.log("__________");
				done();
			});
		});
	});
});
