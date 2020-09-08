const SteamUser = require('steam-user');

const client = new SteamUser();
const creds = require('./config.json');

client.logOn(creds);

client.on('loggedOn', function(details) {
    console.log("Logged into Steam as " + client.steamID.getSteam3RenderedID());
    client.setPersona(SteamUser.EPersonaState.Online);
});

client.on('error', function(e) {
    // Some error occurred during logon
    console.log(e.message);
});