# The Default Usergroup Database Model
- Using the default usergroups for passport.  Custom userGroups should follow these models.


# PLEASE SEE js/account account typedef for up-to-date info
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
	"avatarUrl": "Where the avatar for the user is stored. (Not Implemented, use `/api/media/avatar/:userID/:size\.svg`)",
	"email": "user's email",
	"userGroup": "student||teacher||admin||dev||Custom", //Defined in configs
	"schedules": {
		"student": "1367081a-63d7-48cf-a9ac-a6b47a851b13", (ID of userSchedules db row )
		"teacher": "1367081a-63d7-48cf-a9ac-fdgfdgsdfgsf"
	},
	"groupFields": {//used for fields needed exclusively by one usergroup.  NOTE: normaly there would only be one key in here named after the current userGroup (Will be changed)
		"id": "123456", //school id
		"student": { //dashboard // used when in the student dashboard 
			"settings": {
				//Not Used
			}
		},
		"teacher": { //dashboard // used when in the teacher dashboard 
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

### Example Schedules
#### Student Dash
```json
{
	"a": {
		"teacherID": "564947b0-a382-489c-9a5f-94252d67b50e"
	},
	"b": {
		"teacherID": "abf2c008-8f39-45db-a6da-47d6cdb37a14"
	},
	"c": {
		"teacherID": "abf2c008-8f39-45db-a6da-47d6cdb37a14"
	},
	"d": {
		"teacherID": "564947b0-a382-489c-9a5f-94252d67b50e"
	},
	"lunch1": {
		"room": "Cafeteria",
		"teacherID": null
	},
	"e1": {
		"teacherID": "564947b0-a382-489c-9a5f-94252d67b50e"
	},
	"f": {
		"teacherID": "564947b0-a382-489c-9a5f-94252d67b50e"
	},
	"g": {
		"teacherID": "564947b0-a382-489c-9a5f-94252d67b50e"
	},
	"h": {
		"teacherID": "564947b0-a382-489c-9a5f-94252d67b50e"
	},
	"flex": {
		"room": "unknown",
		"teacherID": null
	},
	"m": {

		"teacherID": null,
		"room": "unknown"

	},
	"home": {
		"teacherID": "abf2c008-8f39-45db-a6da-47d6cdb37a14"
	}
}
```
#### Teacher Dash 
```json 
{
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
}
```