# Passport-Live
[![Build Status](https://travis-ci.org/poster983/Passport-Live.svg?branch=master)](https://travis-ci.org/poster983/Passport-Live)  [![Known Vulnerabilities](https://snyk.io/test/github/poster983/passport-live/badge.svg)](https://snyk.io/test/github/poster983/passport-live)  [![Codacy Grade](https://api.codacy.com/project/badge/Grade/08e8ae52cf0f4fde8f5f02fb275839ea)](https://www.codacy.com/app/josephh2018/Passport-Live?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=poster983/Passport-Live&amp;utm_campaign=Badge_Grade)  [![Codecov](https://img.shields.io/codecov/c/github/poster983/Passport-Live.svg)](https://codecov.io/gh/poster983/Passport-Live)  [![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-000000.svg)](https://github.com/poster983/Passport-Live/blob/master/LICENSE)  [![Maintenance](https://img.shields.io/maintenance/yes/2017.svg)]()

This is the next version of Passport; rebuilt in NodeJS
Passport Live is a modern web app for schools that helps them manage passes.
## NOTE
Raven and Sentry.io are included if you install the optional deps.  See docs for more info
## Installation
NOTE: These instructions are assuming you are using Ubuntu 16.04+ LTS  
1. Install the latest version of NodeJS [Here](https://nodejs.org/en/download/)  
   a. Be sure that NPM was also installed.  
2. Install `rethinkdb` by following [this](https://www.rethinkdb.com/docs/install/ubuntu/) tutorial.  
3. Give your user account ownership of npm.  This is so you don't need sudo.  
   a. First Try: `~$ sudo chown -R $(whoami) ~/.npm`  
   b. If that dosn't work, try: `sudo chown -R $(whoami) /usr/local/lib/node_modules`  
4. Download the latest version of "Passport-Live", `~$ mv` it to your desiered location  
5. `~$ cd` into its containing folder and then Unzip it.  
6. Run `~$ npm install`  
   a. (NOTE.) If you get errors related to "node-sass", run `rm -rf node_modules` and then run `~$ npm install --unsafe-perm`  
7. Run `~$ rethinkdb`  
8. Run in a new termanal instance `~$ npm run configure:db`  
9. Once that is done, run `~$ npm run configure:root` to create an admin permission key to create an account.
10. CTRL^C Exits the program.

## Updating 
We HIGHLY recommend that you use git for updating the code, however please be sure that there are no breaking changes documented or you may have to change any coustom code.  

If you are using git:  
Before you update for the first time, please run `~$ git update-index --skip-worktree config/local.json && git update-index --skip-worktree config/default.json && git update-index --skip-worktree config.js`  

To update, run `git pull`

## Usage
To start the server, run `~$ npm run db` THEN `~$ npm start` from within the folder "package.json" is located.  
[Tmux](https://gist.github.com/MohamedAlaa/2961058) may be useful for servers.

## Special Thanks  
<a href="https://crossbrowsertesting.com/"><img src="https://crossbrowsertesting.com/design/images/brand/cbt-1200x630.png" width="240" height="126" /></a>  
Thanks to [CrossBrowserTesting](https://crossbrowsertesting.com/) we are able to ensure that Passport works, not only on Chrome, but on many popular mobile devices and browsers.  CBT helps us to cut down on UI testing and focus on adding new features.

## Docs 
[github.io docs](https://poster983.github.io/Passport-Live/)  

This is a work in progress.


