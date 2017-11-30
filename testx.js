convertExcel = require('excel-as-json').processFile;
//studentinfohassellSHORT
convertExcel("/home/joseph/Desktop/passportImport/studentinfohassellnodupe.xlsx", undefined, false, function(err, data) {
	if(err) {
		return console.error(err);
	}
	console.log(data, "raw DATA")
	/*
	var mapRule = {
		rule: {
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
			password: "Password"
		},
		defaults: {
			name: {
				salutation: "Ind."
			},
			userGroup: "teacher",
			isVerified: true,
			graduationYear: null,
			isArchived: false
		}
	}
	/*
	var mapRule = {
		rule: {
			name: {
				first: "Student First Name",
				last: "Student Last Name",
				salutation: null
			},
			schoolID: "Student User ID",
			email: "E-Mail",
			graduationYear: "Student Grad Year",
			userGroup: null,
			isVerified: null,
			password: null
		},
		defaults: {
			name: {
				salutation: "Ind."
			},
			userGroup: "student",
			isVerified: true,
			graduationYear: null,
			isArchived: false,
			password: "123"
		}
	}*/
	/*
	var opt = {
		
	}

	var mappedData = data.map(function(n) {
		var returner = {};
		returner.name = {};
		if(!mapRule.rule.name || !mapRule.rule.name.first || !n[mapRule.rule.name.first]) {
			if(mapRule.defaults.name.first) {
				returner.name.first = mapRule.defaults.name.first;
			} else {
				return null;
			}
		} else {
			returner.name.first = n[mapRule.rule.name.first];
		}
		if(!mapRule.rule.name || !mapRule.rule.name.last || !n[mapRule.rule.name.last]) {
			if(mapRule.defaults.name.last) {
				returner.name.last = mapRule.defaults.name.last;
			} else {
				return null;
			}
		} else {
			returner.name.last = n[mapRule.rule.name.last];
		}
		if(!mapRule.rule.name || !mapRule.rule.name.salutation || !n[mapRule.rule.name.salutation]) {
			if(mapRule.defaults.name.salutation) {
				returner.name.salutation = mapRule.defaults.name.salutation;
			} else {
				return null;
			}
		} else {
			returner.name.salutation = n[mapRule.rule.name.salutation];
		}
		if(!mapRule.rule.schoolID  || !n[mapRule.rule.schoolID]) {
			if(mapRule.defaults.schoolID) {
				returner.schoolID = mapRule.defaults.schoolID;
			} else {
				return null;
			}
		} else {
			returner.schoolID = n[mapRule.rule.schoolID];
		}
		if(!mapRule.rule.email  || !n[mapRule.rule.email]) {
			if(mapRule.defaults.email) {
				returner.email = mapRule.defaults.email;
			} else {
				return null;
			}
		} else {
			returner.email = n[mapRule.rule.email];
		}
		if(!mapRule.rule.userGroup  || !n[mapRule.rule.userGroup]) {
			if(mapRule.defaults.userGroup) {
				returner.userGroup = mapRule.defaults.userGroup;
			} else {
				return null;
			}
		} else {
			returner.userGroup = n[mapRule.rule.userGroup];
		}
		if(!mapRule.rule.hasOwnProperty("isVerified")  || !n[mapRule.rule.userGroup]) {
			if(mapRule.defaults.hasOwnProperty("isVerified")) {
				returner.isVerified = mapRule.defaults.isVerified;
			} else {
				return null;
			}
		} else {
			returner.isVerified = n[mapRule.rule.isVerified];
		}

		if(!mapRule.rule.hasOwnProperty("graduationYear")  || !n[mapRule.rule.graduationYear]) {
			if(mapRule.defaults.hasOwnProperty("graduationYear")) {
				returner.graduationYear = mapRule.defaults.graduationYear;
			} else {
				return null;
			}
		} else {
			returner.graduationYear = n[mapRule.rule.graduationYear];
		}

		if(!mapRule.rule.hasOwnProperty("password")  || !n[mapRule.rule.password]) {
			if(mapRule.defaults.hasOwnProperty("password") && typeof mapRule.defaults.password == "string") {
				returner.password = mapRule.defaults.password;
			} else {
				return null;
			}
		} else {
			returner.password = n[mapRule.rule.password];
		}

		return returner;
	})
	results = mappedData.filter(function(v) {
		return (v !== null);
	})
	console.log(results)
	/*Promise.all(mappedDataProm).then(function(results) {
		console.log(results)
		results = results.filter(function(v) {
			return (v !== null);
		})
		console.log(results)
	}).catch(function(err) {
		return console.error(err);
	})*/

	//console.log(mappedData)
	//process.exit();*/
});

/*
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

			if(!mapRule.rule.hasOwnProperty("graduationYear")  || !n[mapRule.rule.graduationYear]) {
				if(mapRule.defaults.hasOwnProperty("graduationYear")) {
					returner.graduationYear = mapRule.defaults.graduationYear;
				} else {
					return gRes(null);
				}
			} else {
				returner.graduationYear = n[mapRule.rule.graduationYear];
			}

			if(!mapRule.rule.hasOwnProperty("password")  || !n[mapRule.rule.password]) {
				if(mapRule.defaults.hasOwnProperty("password") && typeof mapRule.defaults.password == "string") {
					returner.password = mapRule.defaults.password;
				} else {
					return gRes(null);
				}
			} else {
				returner.password = n[mapRule.rule.password];
			}

			return 
			/*
			var passPromice = new Promise(function(resolve, reject) {
				if(!mapRule.rule.hasOwnProperty("password")  || !n[mapRule.rule.password]) { 
					if(mapRule.defaults.hasOwnProperty("password") && typeof mapRule.defaults.password == "function") {
						mapRule.defaults.password(n, returner, function(err, password) {
							console.log("hi")
							if(err) {
								reject();
							} else {
								console.log(password, "pass")
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
				console.log("rej")
				return gRes(null);
			})*
		});*/