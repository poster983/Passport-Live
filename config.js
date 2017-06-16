//FOR chateau DATA EXPLORER ONLY

// RethinkDB settings
exports.host = 'localhost';    // RethinkDB host
exports.port = 28015;          // RethinkDB driver port
exports.authKey = '';          // Authentification key (leave an empty string if you did not set one)

// Express settings
exports.expressPort = 3030;    // Port used by express
exports.debug = true;          // Debug mode
exports.network = 'localhost'  // Network the node app will run on