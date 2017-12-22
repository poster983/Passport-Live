/*
Passport-Live is a modern web app for schools that helps them manage passes.
    Copyright (C) 2017  Joseph Hassell

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

email: hi@josephhassell.com
*/
var express = require('express');
var config = require('config');
var cors = require('cors');
var router = express.Router();
const importJS = require("../../modules/passport-api/import.js")
var ssarv = require("ssarv");
var multer  = require('multer');
var upload = multer({ dest: '../../userUploads/' });
var passport = require("passport");
var db = require("../../modules/db/index.js");

router.use(cors());
router.options('*', cors())

/*
* Searches the bulk log database 
* @link module:js/import
* @function searchBulkImport
* @api GET /api/import/log
* @apiparam {permissionKeyType} type - Must provide an allowed key type defined in ENUM "permissionKeyType".  (Currently only "NEW_ACCOUNT" and "UNKNOWN" are allowed)
* @apiquery {(String|undefined)} name - Bulk Log Name
* @apiquery {(String|undefined)} type - importType. Current values: "account", "schedule" 
* @apiquery {(String|undefined)} from - ISO Strng Low end.  inclusive
* @apiquery {(String|undefined)} to - ISO Strng High end. inclusive
* @apiresponse {Object[]}
*/
router.get("/log", passport.authenticate('jwt', { session: false}), ssarv(["administrator", "admin", "dev"], {locationOfRoles: "user.userGroup"}), function searchBulkImport(req, res, next) {
    importJS.searchBulkLogs({
        name: req.query.name,
        type: req.query.type,
        date: {
            from: req.query.from,
            to: req.query.to
        }
    }).then((logs) => {
        res.json(logs)
    }).catch((err) => {return next(err)})

});

//passport.authenticate('jwt', { session: false}), ssarv(["administrator", "admin", "dev"], {locationOfRoles: "user.userGroup"}),

router.post('/accounts', upload.single('excelImport'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  res.send(req.file)
})
//{name: "testFaculty"}
router.post('/test', function (req, res, next) {
  importJS.importAccountsExcel("/home/joseph/Desktop/passportImport/facultyhassell.xlsx", {
            name: {
                first: "First Name",
                last: "Last Name",
                salutation: null
            },
            schoolID: "Faculty User Id",
            graduationYear: null,
            email: "E-Mail",
            userGroup: null,
            isVerified: null,
            password: null //"Password"
        }, {
            name: {
                salutation: "Ind."
            },
            userGroup: "teacher",
            isVerified: true,
            graduationYear: null,
            password: null
        }, {name: "testFaculty", generatePassword: false}).then(function(transSummery) {
            console.log(transSummery);
            res.json(transSummery)
        }).catch(function(err) {
            console.error(err);
            next(err)
        });
})

router.post('/test/student', function (req, res, next) {
    console.log("GOOO")
  importJS.importAccountsExcel("/home/joseph/Desktop/passportImport/studentinfohassellnodupe.xlsx", {
            name: {
                first: "Student First Name",
                last: "Student Last Name",
                salutation: null
            },
            schoolID: "Student User ID",
            graduationYear: "Student Grad Year",
            email: "E-Mail",
            userGroup: null,
            isVerified: null,
            password: "Password"
        }, {
            name: {
                salutation: "Ind."
            },
            userGroup: "student",
            isVerified: true,
            graduationYear: null
        }).then(function(transSummery) {
            console.log(transSummery);
            res.json(transSummery)
        }).catch(function(err) {
            console.error(err);
            res.json(err)
        });
})

module.exports = router;