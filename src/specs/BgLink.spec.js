const SteamBg = require("../modules/BgLink");
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;


describe("BgLink suit", function () {
    describe("getLinkHash for", function () {
        it("static", function () {
            const hash = '06020b12bdd813d5906d9fe38ba5c12b07bb4cf6';
            const url = `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/items/441870/${hash}.jpg`;

            expect(SteamBg.getLinkHash(url)).to.be.equal(hash);
        });
        it("animated", function () {
            const hash = '248954cba9bc08b6e16c676f5c1814ff823af907';
            const url = `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/items/1263950/${hash}.mp4`;

            expect(SteamBg.getLinkHash(url)).to.be.equal(hash);
        });
        it("empty string as argument", function () {
            expect(SteamBg.getLinkHash(``)).to.be.equal(null);
        });
        it("bad url", function () {
            const url = `https://steamcdn-a.aka`;

            expect(SteamBg.getLinkHash(url)).to.be.equal(null);
        });
        it("link without hash", function () {
            const hash = '';
            const url = `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/items/1263950/${hash}.mp4`;

            expect(SteamBg.getLinkHash(url)).to.be.equal(null);
        });
        it("different type of the argument", function () {
            expect(SteamBg.getLinkHash({})).to.be.equal(null);
        });
    })
});