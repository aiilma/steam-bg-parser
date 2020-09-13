const BgLink = require('./BgLink');

class LinkOwner {
    constructor(steamClient) {
        this._c = steamClient;
        this._bgLink = BgLink;
    }

    get client() {
        return this._c;
    }

    get = async sid => {
        const client = this._c;

        const pItem = await this._getProfileItem(client, sid);

        return this._transformProfileItem(pItem);
    };

    _getProfileItem = async (client, sid) => {
        let r;

        try {
            r = await client.getEquippedProfileItems(sid, {'language': 'english',});
        } catch (e) {
            throw new Error(`Can't get profile item, such a profile doesn't exist`);
        }

        r.sid = sid;
        return r;
    }

    _transformProfileItem = (pItem) => {
        const {profile_background: pBg} = pItem
        const userHasBg = pBg !== null;

        const link = userHasBg ?
            (pBg.movie_mp4 || pBg.image_large) : null;

        return {
            link,
            'owner': pItem.sid,
            'hash': this._bgLink.getLinkHash(link)
        }
    }
}

module.exports = LinkOwner;