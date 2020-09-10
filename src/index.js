const invertBy = require('lodash.invertby');
const fs = require('fs');
const SteamUser = require('steam-user');
const SteamBg = require('./modules/SteamBackground');
const client = new SteamUser();
const DATA_FPATH = './data.json';

const main = () => {
    try {
        const creds = require('./config.json');
        client.logOn(creds);

        client.on('loggedOn', ({client_supplied_steamid: sid}) => {
            console.log(`logged in ${sid}`);
        });
        client.on('friendsList', async () => {
            // get sids
            const actualFriends = invertBy(client.myFriends)['3']; // 3 means invitations, blocks, etc were removed
            const sids = Object.values(actualFriends);

            if (!fs.existsSync(DATA_FPATH)) {
                await fetchBgs(sids);
            } else {
                if (timeToUpdate(DATA_FPATH)) {
                    await fetchBgs(sids);
                } else {
                    console.log(`the data had already been updated`);
                }
            }
        });
        client.on('error', e => {
            throw new e;
        });
    } catch (e) {
        console.log(e.message);
    }
}

const fetchBgs = async (sids) => {
    const data = await getBgs(sids);

    // filter
    const mostValuableHashes = Object.keys(data).filter(bgHash => data[bgHash].owners.length > 1);
    const sorted = mostValuableHashes.map(bgHash => data[bgHash]);

    // write
    fs.writeFile(DATA_FPATH, JSON.stringify(sorted, null, 2), {flag: 'w+'}, err => {
        if (err) throw new Error(err);
        console.log(`the data file has just been fetched`);
    });
}

const getBgs = async (sids) => {
    // get bg object by steamid
    const promises = sids.map(getProfileItem);
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

        bgHash = SteamBg.getLinkHash(bgLink);

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
const getProfileItem = async sid => {
    const r = await client.getEquippedProfileItems(sid, {'language': 'english',});
    r.sid = sid;
    return r;
}

const timeToUpdate = (path) => {
    const {mtime} = fs.statSync(path);
    let passedHours = Math.floor((new Date().getTime() - mtime) / 1000 / 60) / 60;
    return passedHours >= 10
}

main();