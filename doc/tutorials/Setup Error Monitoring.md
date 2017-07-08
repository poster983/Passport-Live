# Setup Error Monitoring

1. Install the optional dependency "raven".  
2. Create a free account with [sentry.io](https://sentry.io) and create a project.  
3. Get your DSN and put it in the `local.json` config file.  It should look like this: 

```json
	"secrets": {
		"loggingDSN": "https://asdfghjklqwertyuiop:asdfghjklqwertyuiop@sentry.io/123456"
	}
```

NOTE:

PLEASE!!! .gitignore local.json before pushing to a public repo. 

