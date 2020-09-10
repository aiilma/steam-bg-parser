const invertBy = require('lodash.invertby');
const fs = require('fs');
const SteamUser = require('steam-user');

const client = new SteamUser();
const DATA_FPATH = './data.json';

client.on('loggedOn', function(details) {

    client.on('friendsList', async () => {
        const actualFriends = invertBy(client.myFriends)['3']; // 3 means invitations, blocks, etc were removed
        const sids = Object.values(actualFriends);

        // check file (execute by date label inside); else - throw error
        const data = await getBgs(sids);
        const mostValuableHashes = Object.keys(data).filter(bgHash => data[bgHash].owners.length > 1);
        const sorted = mostValuableHashes.map(bgHash => {
            // data[bgHash].bgHash = bgHash;
            return data[bgHash];
        });

        fs.writeFile(DATA_FPATH, JSON.stringify(sorted, null, 2), {flag: 'w+'}, err => {
            if (err) throw new Error(err);
        });
    })
});

client.on('error', function(e) {
    // Some error occurred during logon
    console.log(e.message);
});

const main = () => {
    try {

        const creds = require('./config.json');
        client.logOn(creds);

    } catch (e) {
        console.log(e.message);
    }
}

const getBgLinkHash = (link) => {
    link = link || '';
    const template = /^https:\/\/steamcdn-a\.akamaihd\.net\/steamcommunity\/public\/images\/items\/.*\/(.*)\..*$/;
    const matches = link.match(template);
    return matches ? matches[1] : null;
}

const getBgs = async (sids) => {
    // get bg object by steamid
    const promises = sids.map(async sid => {
        const r = await client.getEquippedProfileItems(sid, {'language': 'english',});
        r.sid = sid;
        return r;
    });
    const response = await Promise.all(promises);
    const withBgs = response.filter(item => item.profile_background !== null);

    const data = {};
    withBgs.forEach(item => {
        let bgHash, {
            sid,
            profile_background: {
                movie_mp4,
                image_large: bgLink,
            },
        } = item;

        if (movie_mp4 !== null) bgLink = movie_mp4; // get animated if exists

        bgHash = getBgLinkHash(bgLink);

        // check if the key of the bg obj doesn't exist
        if (!data.hasOwnProperty(bgHash)) {
            data[bgHash] = {
                'link': bgLink,
                'owners': [],
            };
        }

        // push the owner's sid by the bg's key into an owner's list :
        data[bgHash]['owners'].push(sid);
    })
    return data;
}

const needsToRefresh = (path) => {
    const {mtime} = fs.statSync(path);
    let passedHours = Math.floor((new Date().getTime() - mtime) / 1000 / 60) / 60;
    return passedHours >= 10
}

main();

// test.map(item => getBgLinkHash(item.profile_background.image_large))