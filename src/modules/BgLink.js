class BgLink {
    constructor(steamClient) {
        this._c = steamClient;
    }

    get client() {
        return this._c;
    }

    static getLinkHash(link) {
        link = (typeof link === "string" && link) || '';

        const template = /^https:\/\/steamcdn-a\.akamaihd\.net\/steamcommunity\/public\/images\/items\/.*\/(.*)\..*$/;
        const matches = link.match(template);

        return (matches && matches[1]) ? matches[1] : null;
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

        return {
            'owner': pItem.sid,
            'link': pBg !== null ?
                (pBg.movie_mp4 || pBg.image_large) : null,
        };
    }
}

module.exports = BgLink;