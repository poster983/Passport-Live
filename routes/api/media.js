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
* @module mediaRESTAPI
*/
var express = require("express");
var router = express.Router();
var r = require("rethinkdb")
var db = require("../../modules/db/index.js");
var GeoPattern = require("geopattern");
var jdenticon = require("jdenticon");
var crypto = require("crypto");
var cors = require("cors");
var utils = require("../../modules/passport-utilss/index.js");

router.use(cors());
router.options('*', cors())

jdenticon.config = {
    lightness: {
        color: [0.0, 1.0],
        grayscale: [0.3, 0.5]
    },
    saturation: 0.5
};



/**
* Generates a unique backdrop for each user
* @function generateBackdrop
* @async
* @param {request} req
* @param {response} res
* @api GET /api/media/background/:id.svg
* @apiparam {string} id ID of the user.
* @apiresponse {image/svg\u002Bxml} Returnes the unique svg image
* @todo move rethink db to passport-api module
*/
router.get("/background/:id.svg", utils.rateLimit.mediaBruteforce.prevent, function generateBackdrop(req, res, next) {
    r.table("accounts").get(req.params.id).run(db.conn(), function(err, data) {
        if (err) {
            return next(err);
        } 
        if(data) {
            var pattern = GeoPattern.generate(data.name.salutation + " " + data.name.first + " " + data.name.last, {baseColor: "#b71c1c"});
            var svg = pattern.toSvg();
            var color = pattern.color;
            res.setHeader("Content-Type", "image/svg+xml");
            res.status(200).send(svg);
            //res.sendFile(svg)
        } else {
            var err = new Error("Not Found");
            err.status = 404;
            return next(err)
        }

    })
    
});

/**
* Gets an avatar for the user
* @function getIdenticon
* @async
* @param {request} req
* @param {response} res
* @api GET /api/media/avatar/:id/:size.svg
* @apiparam {string} id ID of the user.
* @apiparam {string} size How big the svg should be
* @apiresponse {image/svg\u002Bxml} Returnes the avatar png
* @todo move rethink db to passport-api module
*/
router.get("/avatar/:id/:size.svg", utils.rateLimit.mediaBruteforce.prevent, function getAvatar(req, res, next) {
    var size = parseInt(req.params.size)
    if(isNaN(size)) {
         var err = new Error("Size must be a number");
                err.status = 400;
                return next(err)
    } else {
        r.table("accounts").get(req.params.id).run(db.conn(), function(err, data) {
            if (err) {
                return next(err);
            } 
            if(data) {
                var hash = crypto.createHash("md5").update(data.name.salutation + " " + data.name.first + " " + data.name.last).digest("hex")
                var svg = jdenticon.toSvg(hash, size);
                res.setHeader("Content-Type", "image/svg+xml");
                res.status(200).send(svg);
            } else {
                var err = new Error("Not Found");
                err.status = 404;
                return next(err)
            }

        })
    }
});

 
module.exports = router;