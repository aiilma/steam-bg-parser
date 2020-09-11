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
            const sids = mapFriendsToSids(client.myFriends, '3');

            if (shouldHandle(DATA_FPATH)) {
                const data = await getBgs(sids);

                // filter
                const hash = Object.keys(data).filter(bgHash => data[bgHash].owners.length >= 3);
                const filtered = hash.map(bgHash => data[bgHash]);
                // const filtered = data.filter(item => item.owners.length >= 3);

                saveToFile(filtered, DATA_FPATH);
            } else
                console.log(`the data were fetched`);
        });
        client.on('error', e => {
            throw new e;
        });
    } catch (e) {
        console.log(e.message);
    }
}

const mapFriendsToSids = (friends, typeId) => {
    const invertBy = require('lodash.invertby');

    const actualFriends = invertBy(friends)[typeId]; // 3 means invitations, blocks, etc were removed

    return Object.values(actualFriends);
}
const shouldHandle = (path) => !fs.existsSync(path) || timeToUpdate(path);
const timeToUpdate = (path) => {
    const {mtime} = fs.statSync(path);
    let passedHours = Math.floor((new Date().getTime() - mtime) / 1000 / 60) / 60;
    return passedHours >= 10
}

const getBgs = async (sids) => {
    const pItems = await getProfileItems(sids);

    const data = {};
    pItems.forEach(item => {
        let bgHash, {
            sid, profile_background: {
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
const getProfileItems = async (sids) => {
    const hasBackground = item => item.profile_background !== null;
    const getProfileItem = async sid => {
        const r = await client.getEquippedProfileItems(sid, {'language': 'english',});
        r.sid = sid;
        return r;
    }

    const promises = sids.map(getProfileItem);
    const response = await Promise.all(promises);

    return response.filter(hasBackground);
}

const saveToFile = (data, path) => {
    const dataStr = JSON.stringify(data, null, 2);

    fs.writeFile(path, dataStr, {flag: 'w+'}, err => {
        if (err) throw new Error(err);
        console.log(`the data file has just been fetched`);
    });
}


main();