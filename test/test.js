var request = require("request");
var assert = require('assert');
var server = require('../bin/www');
var base_url = "http://localhost:3000/"


describe("Server Test", function(){
	describe("GET /", function() {
		it("returns status code 200 Continue", function() {
			request.get(base_url, function(error, response, body) {
				assert.equal(200, response.statusCode);
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
				server.closeServer();
				done();
      });
    });
  });
});