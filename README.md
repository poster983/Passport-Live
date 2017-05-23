# Passport-Live
[![Build Status](https://travis-ci.org/poster983/Passport-Live.svg?branch=master)](https://travis-ci.org/poster983/Passport-Live)  [![Known Vulnerabilities](https://snyk.io/test/github/poster983/passport-live/badge.svg)](https://snyk.io/test/github/poster983/passport-live)  [![Codacy Grade](https://api.codacy.com/project/badge/Grade/08e8ae52cf0f4fde8f5f02fb275839ea)](https://www.codacy.com/app/josephh2018/Passport-Live?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=poster983/Passport-Live&amp;utm_campaign=Badge_Grade)  [![Codecov](https://img.shields.io/codecov/c/github/poster983/Passport-Live.svg)](https://codecov.io/gh/poster983/Passport-Live)  [![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-000000.svg)](https://github.com/poster983/Passport-Live/blob/master/LICENSE)

This is the next version of Passport; rebuilt in NodeJS
Passport Live is a modern web app for schools that helps them manage passes.
## Installation
NOTE: These instructions are assuming you are using Ubuntu 16.04 LTS  
1. Install the latest version of NodeJS [Here] (https://nodejs.org/en/download/)  
   a. Be sure that NPM was also installed.  
2. Install `rethinkdb` by following [this] (https://www.rethinkdb.com/docs/install/ubuntu/) tutorial.  
3. Give your user account ownership of npm.  This is so you don't need sudo.  
   a. First Try: `~$ sudo chown -R $(whoami) ~/.npm`  
   b. If that dosn't work, try: `sudo chown -R $(whoami) /usr/local/lib/node_modules`  
4. Download the latest version of "Passport-Live", `~$ mv` it to your desiered location  
5. `~$ cd` into its containing folder and then Unzip it.  
6. Run `~$ npm install -g`  
7. Run `~$ npm run start:db`  
8. Run in a new termanal instance `~$ npm run configure:db`  
9. CTRL^C Exits the program.

## Usage
To start the server, run ~~~$ npm start~~ `~$ npm run start:db` THEN `~$ npm run start:node` from within the folder "package.json" is located.
