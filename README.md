# Passport-Live
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
6. Run `npm install -g`
7. Done
## Usage
To start the server, run <code>npm start</code> from within the folder "package.json" is located.
