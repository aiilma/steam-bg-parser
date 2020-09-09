const invertBy = require('lodash.invertby');
const fs = require('fs');

const SteamUser = require('steam-user');

const client = new SteamUser();
const creds = require('./config.json');

client.logOn(creds);

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
        let {
            sid,
            profile_background: {
                name, movie_mp4,
                image_large: bgLink,
            },
        } = item;

        if (movie_mp4 !== null) bgLink = movie_mp4; // get animated if exists

        // check if the key of the bg obj doesn't exist
        if (!data.hasOwnProperty(name)) {
            data[name] = {
                'link': bgLink,
                'owners': [],
            };
        }

        // push the owner's sid by the bg's key into an owner's list :
        data[name]['owners'].push(sid);
    })
    return data;
}

client.on('loggedOn', function(details) {

    client.on('friendsList', async () => {
        const actualFriends = invertBy(client.myFriends)['3']; // 3 means invitations, blocks, etc were removed
        const sids = Object.values(actualFriends);

        const data = await getBgs(sids);
        console.log(data);
    })
});

client.on('error', function(e) {
    // Some error occurred during logon
    console.log(e.message);
});



/* get all the info about the game */
// const selectedSID = '76561199067599853';
// client.requestRichPresence(730, [selectedSID], 'english', function(e, res) {
//     if (e) console.log(e);
//
//     const chosen = res.users[selectedSID];
//     console.log(chosen);
// })


/* reset bg by a single command */
// client.chat.on('friendMessage', function(data) {
//     const {msg} = data;
//
//     if (msg === `bg.reset()`) {
//         client.setProfileBackground(0, function(e) {
//             if (e) console.log(e.message);
//         });
//     }
//
//     console.log(data.message);
// })

// console.log(sids);
// client.getPersonas(sids, function(err, personas) {
//     console.log(personas);
// })