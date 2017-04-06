var express = require('express');
var router = express.Router();

/* GET Student page. */
router.get('/', function(req, res, next) {
  res.render('student/index', { doc_Title: 'Passport-Student' });
});

module.exports = router;
