convertExcel = require('excel-as-json').processFile;
convertExcel("/home/joseph/Desktop/passportImport/facultyhassell.xlsx", undefined, false, function(err, data) {
	if(err) {
		return console.error(err);
	}
	console.log(data)
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
			isVerified: null
		},
		defaults: {
			name: {
				salutation: "Ind."
			},
			userGroup: "teacher",
			isVerified: true,
			isArchived: false
		}
	}
	var opt = {
		

	}

	data.map(function(n) {
		return {
			name: {
				first: n[mapRule.name.first],
				last: n[mapRule.name.last],
				salutation: n[mapRule.name.salutation]
			},
			schoolID: "Faculty User Id",
			email: "E-Mail"
		};
	})
	//process.exit();
});