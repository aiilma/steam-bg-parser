# steam-bg-parser
This is a NodeJS package that gives you an opportunity to fetch all the steam user's backgrounds by list of steamID64s' as an input.

At first, you must to fetch the necessary data by users' steamids:\
[Demo](https://user-images.githubusercontent.com/41314276/94438022-35e07200-01a7-11eb-8d32-84d021b13c6d.gif)\
Next, you need to look for the file with the fetched information. In my case I specified a file with the name _data.json_ in the constructor of the **BgParser** (it creates a new file if it doesn't exist).

Its content is in the following format:
```json
[
  {
    "hash": "5d55e33857c40b4ae57aaba611cf7ce8a2b41c5b",
    "link": "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/items/1263950/5d55e33857c40b4ae57aaba611cf7ce8a2b41c5b.mp4",
    "owners": [
      "76561197978670308",
      "76561198044205529",
      "76561198049991149",
      "76561198051995114",
      "76561198065311905",
      "76561198074632130",
      "76561198154545657",
      "76561198160842004",
      "76561198195848267",
      "76561198237563864",
      "76561198282845463",
      "76561198347167115",
      "76561198365140815",
      "76561198913773014"
    ]
  },
]
```
You should notice that you can reach the background's link by the **link** key which is unique and different from others.\
It's all grouped by that **hash** key.\
And finally, you have the **owners** key which tells you how many users have this concrete background under the **link** prop in their profiles. That **owners** key is the array which contains the users steamids.

So, you can test it out to make sure that a user has a certain background in his profile by copying some of the value from the **owners** array and pasting it into the following link: steamcommunity.com/profiles/_**steamid64**_\
For instance: https://steamcommunity.com/profiles/76561198913773014
