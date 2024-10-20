import { Season } from "@spt/models/enums/Season";
import { randomSeasonWeighting } from "../config/config.json";

export const SeasonMap = {
  0: "SUMMER",
  1: "AUTUMN",
  2: "WINTER",
  3: "SPRING",
  4: "STORM",
};

export const getWeightedSeason = (): Season => {
  const all = [];
  const itemKeys = Object.keys(randomSeasonWeighting);
  for (const key of itemKeys) {
    for (let i = 0; i < randomSeasonWeighting[key]; i++) {
      all.push(key);
    }
  }

  const season: keyof typeof Season =
    all[Math.round(Math.random() * (all.length - 1))];

  return Season[season];
};

export const saveToFile = (data, filePath) => {
  var fs = require("fs");
  let dir = __dirname;
  let dirArray = dir.split("\\");
  const directory = `${dirArray[dirArray.length - 4]}/${
    dirArray[dirArray.length - 3]
  }/${dirArray[dirArray.length - 2]}/`;

  fs.writeFile(
    directory + filePath,
    JSON.stringify(data, null, 4),
    function (err) {
      if (err) throw err;
    }
  );
};
