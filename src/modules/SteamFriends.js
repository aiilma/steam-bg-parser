const invertBy = require('lodash.invertby');

class SteamFriends {

    constructor() {
    }

    // 3 means invitations, blocks, etc were removed
    static getSids = (friends, typeId = '3') => {
        const actualFriends = invertBy(friends)[typeId];

        return Object.values(actualFriends);
    }

}

module.exports = SteamFriends;