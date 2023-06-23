// Wrap instantiation of sails.io.js in a module, so it can be safely shared
// required from different modules even if they're nested within each other.
var io = require('sails.io.js/sails.io.js')(require('socket.io-client/dist/socket.io.js'));
module.exports = io;
