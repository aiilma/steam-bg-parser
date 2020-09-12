Array.prototype.mapAsync = async function (cb) {
    const promises = this.map(cb);
    return await Promise.all(promises);
}