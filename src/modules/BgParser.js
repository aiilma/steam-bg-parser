const FileStorage = require('./FileStorage');
const LinkOwner = require('./LinkOwner');

Array.prototype.mapAsync = async function (cb) {
    const promises = this.map(cb);
    return await Promise.all(promises);
}

class BgParser {
    constructor(client, path) {
        this._client = client;
        this._linkOwner = new LinkOwner(this._client);
        this._storage = new FileStorage(path);
    }

    get shouldParse() {
        const notFile = !this._storage.exists();
        const passedTimeAfterModified = Math.floor((new Date().getTime() - this._storage.modified) / 1000 / 60) / 60;

        return notFile || passedTimeAfterModified >= 10;
    }

    go = async (sids, minOwners) => {
        const linkOwnerItems = await this._getLinkOwnerItems(sids);

        let data = this._order(linkOwnerItems);
        if (minOwners !== undefined)
            data = this._filter(data, minOwners);

        await this._storage.write(data);

        return data;
    }

    _getLinkOwnerItems = async sids => await sids.mapAsync(this._linkOwner.get)

    _order = items => {
        return items.reduce((orded, item) => {
            const {hash, owner, link} = item;

            const keys = orded.map(item => item.hash);
            const hashIdx = keys.indexOf(hash);
            const hashFound = hashIdx !== -1;

            if (hashFound) {
                const oldOwners = orded[hashIdx].owners;
                orded[hashIdx].owners = [
                    ...oldOwners,
                    owner
                ]
                return [
                    ...orded,
                ];
            } else {
                return [
                    ...orded,
                    {
                        hash, link, owners: [owner],
                    }
                ];
            }
        }, []);
    }

    _filter = (items, min) => items.filter(({owners}) => owners.length >= min)

    // _withLink = item => item.link !== null;
    // _withoutLink = item => item.link === null;
}

module.exports = BgParser;