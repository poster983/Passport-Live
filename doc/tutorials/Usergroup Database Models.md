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
		"student": {
			"id": "123456"
		},
		"teacher": {
			"id": "456789"
		},
		"custom": {
			"data": "FooBar",
			"key": "value"
		}
	}, 
	"dashboards": { // when a user connects to a dashboard for the first time, it will start adding settings and other things here.  
		"student": {
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
		"custom": {// must match the dashboard route

		}
	},
	"password": "HashedPass"
}
```

