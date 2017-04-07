var express = require('express');
var config = require('config');
var router = express.Router();

/* GET Student page. */
router.get('/', function(req, res, next) {
	enabledPassGroups = config.get('passGroups.enabledPassGroups');
	var passGroups = new Array();

	for (var i = 0, len = enabledPassGroups.length; i < len; i++) {
		/*
		if(config.get('passGroups.' + enabledPassGroups[i] + '.viewType') == "select") {

		}
		*/
		passGroups[i] = JSON.parse('{ "viewName":"' + config.get('passGroups.' + enabledPassGroups[i] + '.viewName') + '", "value": "' + config.get('passGroups.' + enabledPassGroups[i] + '.customGroupID') + '"}');
		
	}
    res.render('student/index', { doc_Title: 'Passport-Student', passGroups: passGroups});
});

module.exports = router;
