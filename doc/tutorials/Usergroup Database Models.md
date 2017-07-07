# The Default Usergroup Database Model
- Using the default usergroups for passport.  Custom userGroups should follow these models.

 Full:  

```json
{
	"id": "RethinkDB Issued ID.  Don't set",
	"name": {
		"first": "Given Name",
		"last": "Family Name",
		"salutation": "Mr.||Ms.||Dr.||Ect.",
		"middle": "Reserved for possible future use"
	}, 
	"avatarUrl": "Where the avatar for the user is stored.",
	"email": "user's email",
	"userGroup": "student||teacher||admin||dev||Custom", //Defined in configs
	"groupFields": {//used for fields needed exclusively by one usergroup.  NOTE: normaly there would only be one key in here named after the current userGroup
		"id": "123456", //school id
		"student": { //dashboard // used when in the student dashboard 
			"periodSchedule": {
				"a": {
					"teacherID": "46545645-456-4-45645-45646" //id from database
				},
				"b": {
					"teacherID": "456486-5190814-4567" //id from database
				},
				"lunch1": {
					"teacherID": null, //if teacherID is null or undefined, passport expects data about where the period takes place
					"room": "Cafeteria"
				}
			}, 
			"settings": {
				//Need to figure out later
			}
		},
		"teacher": { //dashboard // used when in the teacher dashboard 
			"periodSchedule": {
					"a": {
						"room": 1,
						"isTeaching": true,
						"className": "Biology"
					},
					"b": {
						"room": 1,
						"isTeaching": true,
						"className": "Biology"
					},
					"c": {
						"room": 4500,
						"isTeaching": false,
						"className": "Off Period"
					},
					"d": {
						"room": 3,
						"isTeaching": true,
						"className": "Algebra 1"
					},
					"lunch1": {
						"room": "Cafeteria",
						"isTeaching": false,
						"className": "Lunch"
					},
					"e1": {
						"room": 3,
						"isTeaching": true,
						"className": "Algebra 1"
					},
					"f": {
						"room": 1,
						"isTeaching": true,
						"className": "Biology"
					},
					"g": {
						"room": 25,
						"isTeaching": false,
						"className": "Sub Period"
					},
					"h": {
						"room": 1,
						"isTeaching": true,
						"className": "Biology"
					},
					"flex": {
						"room": 1,
						"isTeaching": false
					},
					"m": {

						"isTeaching": false

					},
					"home": {
						"room": 4500,
						"isTeaching": false,
						"className": "Homeroom"
					}
				
			},
			"settings": {
				"daysInAdvanceForPasses": 4 //howmany days a student can request a pass in advance
			},
		},
		"custom": {
			"data": "FooBar",
			"key": "value"
		}
	}, 
	"password": "HashedPass"
}
```

