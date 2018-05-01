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
/**
 * A set of Apis for importing large amounts of data into passport
 * @module api/import
 */
var express = require("express");
var config = require("config");
var cors = require("cors");
var router = express.Router();
const importJS = require("../../modules/passport-api/import.js");
var ssarv = require("ssarv");
var passport = require("passport");
var db = require("../../modules/db/index.js");
let utils = require("../../modules/passport-utils/index.js");

router.use(cors());
router.options("*", cors());

/**
 * Searches the bulk log database 
 * @link module:api/import
 * @function searchBulkImport
 * @api GET /api/import/log
 * @apiquery {(String|undefined)} name - Bulk Log Name
 * @apiquery {(String|undefined)} type - importType. Current values: "account", "schedule" 
 * @apiquery {(String|undefined)} from - ISO String Low end.  inclusive
 * @apiquery {(String|undefined)} to - ISO String High end. inclusive
 * @apiresponse {Object[]}
 */
router.get("/log", passport.authenticate("jwt", {
    session: false
}), utils.dashboardPermission(["administrator"]), function searchBulkImport(req, res, next) {
    importJS.searchBulkLogs({
        name: req.query.name,
        type: req.query.type,
        date: {
            from: req.query.from,
            to: req.query.to
        }
    }).then((logs) => {
        res.json(logs);
    }).catch((err) => {
        return next(err);
    });

});




/** 
 * Takes in an array of account json objects and imports them 
 * NOTE: Email domains are still must follow userGroup settings.
 * If the json object lacks the nessessary values to create an account, the row is skipped 
 * @link module:api/import
 * @function importJsonAccounts
 * @api POST /api/import/accounts
 * @param {Object} req.body - Include these in the body
 * @param {accountImport[]} req.body.accounts - The accountImport objects 
 * @param {String} req.body.importName - a (non unique) name for this import job
 * @apibody {Object} req.body
 * @apiresponse {Object[]} - Array of objects with key "account" containing the user imported, and key "error" with an error that occured during import for that user 
 */

router.post("/accounts", passport.authenticate("jwt", {
    session: false
}), utils.dashboardPermission(["administrator"]), function importJsonAccounts(req, res, next) {
    importJS.accounts.json(req.body.accounts, req.body.importName).then((trans) => {
        return res.json(trans);
    }).catch((err) => {
        return next(err);
    });
});

/** 
 * Sends activation emails to all unverified accounts.  Ratelimits: 1 request per bulk id per 10 mins 
 * @link module:api/import
 * @function activate
 * @api POST /api/import/accounts/:bulkID/activate
 * @apiparam {String} bulkID - The id of the bulk import log.
 * @apiresponse {Object} - A 202 accepted will be returned 
 */

router.post("/accounts/:bulkID/activate", passport.authenticate("jwt", {
    session: false
}), utils.dashboardPermission(["administrator"]), 
utils.rateLimit.sendEmail.getMiddleware({
    key: function(req, res, next) {
        next(req.params.bulkID);
    }
}), function activate(req, res, next) {
    if (typeof req.params.bulkID !== "string") {
        let err = new Error("Not Found");
        err.status = 404;
        return next(err);
    }
    importJS.accounts.sendActivation(req.params.bulkID).then((trans) => {
        delete trans.cursor;
        return res.status(202).json(trans);
    }).catch((err) => {
        req.brute.reset()
        return next(err);
    });
});



/** 
 * Undos a bulk import for accounts.  This will delete records and cannot be undone.
 * @link module:api/import
 * @function rollback
 * @api DELETE /api/import/accounts/:bulkID/rollback
 * @apiquery {Boolean} [ignoreVerified=true] - Will leave accounts that have been verified untouched
 * @apiparam {String} bulkID - The id of the bulk import log.
 * @apiresponse {Object} - The transaction statement
 */

router.delete("/accounts/:bulkID/rollback", passport.authenticate("jwt", {
    session: false
}), utils.dashboardPermission(["administrator"]), function rollback(req, res, next) {
    if (typeof req.params.bulkID !== "string") {
        let err = new Error("Not Found");
        err.status = 404;
        return next(err);
    }
    if (req.query.ignoreVerified === "false") {
        req.query.ignoreVerified = false;
    } else {
        req.query.ignoreVerified = true;
    }
    importJS.accounts.rollback(req.params.bulkID, req.query.ignoreVerified).then((trans) => {
        return res.json(trans);
    }).catch((err) => {
        return next(err);
    });
});



/*router.post('/accounts', upload.single('excelImport'), function (req, res, next) {
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
})*/

module.exports = router;