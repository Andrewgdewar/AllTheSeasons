/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import {
  enable,
  seasonLength,
  randomSeason,
  consoleMessages,
} from "../config/config.json";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { getWeightedSeason, seasonDates, SeasonMap } from "./utlis";

class AllTheSeasons implements IPreSptLoadMod {
  preSptLoad(container: DependencyContainer): void {
    const configServer = container.resolve<ConfigServer>("ConfigServer");

    const WeatherValues = configServer.getConfig<IWeatherConfig>(
      ConfigTypes.WEATHER
    );

    WeatherValues.seasonDates = seasonDates;

    const staticRouterModService = container.resolve<StaticRouterModService>(
      "StaticRouterModService"
    );

    WeatherValues["last"] = Date.now();
    WeatherValues.overrideSeason = getWeightedSeason();

    consoleMessages &&
      console.log(
        "AllTheSeasons: Season set to:",
        SeasonMap[WeatherValues.overrideSeason]
      );

    enable &&
      staticRouterModService.registerStaticRouter(
        `AllTheSeasons`,
        [
          {
            url: "/client/match/offline/end",
            action: async (_url, info, sessionId, output) => {
              const currentSeason = SeasonMap[WeatherValues.overrideSeason];

              switch (true) {
                case randomSeason:
                  // Set a random season after each raid end
                  WeatherValues.overrideSeason = getWeightedSeason();

                  consoleMessages &&
                    console.log(
                      "AllTheSeasons: Random season set to: ",
                      SeasonMap[WeatherValues.overrideSeason]
                    );
                  break;

                case Date.now() - WeatherValues["last"] >=
                  seasonLength[currentSeason] * 60000:
                  WeatherValues["last"] = Date.now();

                  if (WeatherValues.overrideSeason === 3) {
                    WeatherValues.overrideSeason = 0;
                  } else {
                    WeatherValues.overrideSeason += 1;
                  }

                  consoleMessages &&
                    console.log(
                      "AllTheSeasons: The season has changed! It is now:",
                      SeasonMap[WeatherValues.overrideSeason]
                    );
                  break;

                default:
                  consoleMessages &&
                    console.log(
                      "AllTheSeasons: The season is still ",
                      SeasonMap[WeatherValues.overrideSeason] + ".",
                      "Time until next season:",
                      Math.round(
                        (seasonLength[currentSeason] * 60000 -
                          (Date.now() - WeatherValues["last"])) /
                          60000
                      ),
                      "Minutes."
                    );
                  break;
              }

              return output;
            },
          },
        ],
        "aki"
      );
  }
}

module.exports = { mod: new AllTheSeasons() };
