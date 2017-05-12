var request = require("request");
var assert = require('assert');
var server = require('../bin/www');
var base_url = "http://localhost:3000/"
describe("Server Test", function(){
	describe("GET /", function() {
		it("returns status code 200", function() {
			request.get(base_url, function(error, response, body) {
				assert.equal(200, response.statusCode);
				done();
      });
    });
  });
});