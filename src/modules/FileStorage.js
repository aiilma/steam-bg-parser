const fs = require('fs');

class FileStorage {
    constructor(path) {
        this._path = path;
    }

    get modified() {
        return this.exists() ?
            fs.statSync(this._path).mtime : new Date();
    }

    write = data => {
        const dataStr = JSON.stringify(data, null, 2);
        fs.writeFile(this._path, dataStr, {flag: 'w+'}, err => {
            if (err) throw new Error(err);
            console.log(`the data file has just been fetched`);
        });
    }

    exists = () => fs.existsSync(this._path);
}

module.exports = FileStorage;