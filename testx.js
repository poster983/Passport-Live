convertExcel = require('excel-as-json').processFile;
convertExcel("/home/joseph/Desktop/passportImport/facultyhassell.xlsx", undefined, false, function(err, data) {
	if(err) {
		return console.error(err);
	}
	//console.log(data, "raw DATA")
	var mapRule = {
		rule: {
			name: {
				first: "First Name",
				last: "Last Name",
				salutation: null
			},
			schoolID: "Faculty User Id",
			email: "E-Mail",
			userGroup: null,
			isVerified: null,
			password: null
		},
		defaults: {
			name: {
				salutation: "Ind."
			},
			userGroup: "teacher",
			isVerified: true,
			isArchived: false,
			password: "123"
		}
	}
	/*
	var opt = {
		passwordRule

	}*/

	var mappedDataProm = data.map(function(n) {
		return new Promise(function(gRes, gRej) {
			var returner = {};
			returner.name = {};
			if(!mapRule.rule.name || !mapRule.rule.name.first || !n[mapRule.rule.name.first]) {
				if(mapRule.defaults.name.first) {
					returner.name.first = mapRule.defaults.name.first;
				} else {
					return gRes(null);
				}
			} else {
				returner.name.first = n[mapRule.rule.name.first];
			}
			if(!mapRule.rule.name || !mapRule.rule.name.last || !n[mapRule.rule.name.last]) {
				if(mapRule.defaults.name.last) {
					returner.name.last = mapRule.defaults.name.last;
				} else {
					return gRes(null);
				}
			} else {
				returner.name.last = n[mapRule.rule.name.last];
			}
			if(!mapRule.rule.name || !mapRule.rule.name.salutation || !n[mapRule.rule.name.salutation]) {
				if(mapRule.defaults.name.salutation) {
					returner.name.salutation = mapRule.defaults.name.salutation;
				} else {
					return gRes(null);
				}
			} else {
				returner.name.salutation = n[mapRule.rule.name.salutation];
			}
			if(!mapRule.rule.schoolID  || !n[mapRule.rule.schoolID]) {
				if(mapRule.defaults.schoolID) {
					returner.schoolID = mapRule.defaults.schoolID;
				} else {
					return gRes(null);
				}
			} else {
				returner.schoolID = n[mapRule.rule.schoolID];
			}
			if(!mapRule.rule.email  || !n[mapRule.rule.email]) {
				if(mapRule.defaults.email) {
					returner.email = mapRule.defaults.email;
				} else {
					return gRes(null);
				}
			} else {
				returner.email = n[mapRule.rule.email];
			}
			if(!mapRule.rule.userGroup  || !n[mapRule.rule.userGroup]) {
				if(mapRule.defaults.userGroup) {
					returner.userGroup = mapRule.defaults.userGroup;
				} else {
					return gRes(null);
				}
			} else {
				returner.userGroup = n[mapRule.rule.userGroup];
			}
			if(!mapRule.rule.hasOwnProperty("isVerified")  || !n[mapRule.rule.userGroup]) {
				if(mapRule.defaults.hasOwnProperty("isVerified")) {
					returner.isVerified = mapRule.defaults.isVerified;
				} else {
					return gRes(null);
				}
			} else {
				returner.isVerified = n[mapRule.rule.isVerified];
			}
			var passPromice = new Promise(function(resolve, reject) {
				if(!mapRule.rule.hasOwnProperty("password")  || !n[mapRule.rule.password]) { 
					if(mapRule.defaults.hasOwnProperty("password") && typeof mapRule.defaults.password == "function") {
						mapRule.defaults.password(returner, function(err, password) {
							if(err) {
								reject();
							} else {
								returner.password = password;
								resolve();
							}
						})
					} else if(mapRule.defaults.hasOwnProperty("password") && typeof mapRule.defaults.password != "function") {
						returner.password = mapRule.defaults.password;
						resolve();
					} else {
						reject();
					}
				} else {
					returner.password = n[mapRule.rule.password];
					resolve();
				}
			})
			//console.log(returner)
			passPromice.then(function() {
				//console.log("GOOOo")
				return gRes(returner);
			}).catch(function() {
				return gRes(null);
			})
		});
		
	})

	Promise.all(mappedDataProm).then(function(results) {
		console.log(results, "this")
	}).catch(function(err) {
		return console.error(err);
	})

	//console.log(mappedData)
	//process.exit();
});