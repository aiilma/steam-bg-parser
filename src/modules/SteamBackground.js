class SteamBackground {

    static getLinkHash(link) {
        link = (typeof link === "string" && link) || '';

        const template = /^https:\/\/steamcdn-a\.akamaihd\.net\/steamcommunity\/public\/images\/items\/.*\/(.*)\..*$/;
        const matches = link.match(template);

        return (matches && matches[1]) ? matches[1] : null;
    }

}

module.exports = SteamBackground;