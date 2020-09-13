require('./utils/polyfill');

const main = (cfg) => {
    // vendor
    const SteamUser = require('steam-user');
    // lib
    const BgParser = require('./modules/BgParser');
    const StmFriends = require('./modules/SteamFriends');

    const client = new SteamUser();

    try {
        client.logOn(cfg);

        client.on('loggedOn', ({client_supplied_steamid: sid}) => {
            console.log(`logged in ${sid}`);
        });
        client.on('friendsList', async () => {
            const parser = new BgParser(client, './data.json');
            let data = [];

            if (parser.shouldParse) {
                const sids = StmFriends.getSids(client.myFriends);
                data = await parser.go(sids, 3);
            }
            else {
                console.log('not parsed. read from the file');
            }

            console.log(data);
        });
        client.on('error', e => {
            throw new e;
        });
    } catch (e) {
        console.log(e.message);
    }
}


const cfg = require('./config.json');
main(cfg);