# Cyberpunk for Monolith

The Cyberpunk game for [Monolith](https://github.com/whudsontosh/monolith): Cyberpunk 2020 runners,
the GM console, homebrew, campaign packages and the Night City look.

Players don't download anything from here: Monolith installs this game from **More games** and
updates it whenever it's opened.

## What's here

| Path | What it is |
|---|---|
| `game.json` | The game's manifest: id, version, the Monolith it needs, its rulesets and files |
| `src/` | The game: rules and data (`rules.js`), the builder and sheet (`player.js`), checks, attacks, item explanations, the GM screens (`gm.js`), homebrew and packages, the paper sheet, and its look (`skin.css`, `fonts/`) |
| `src/net*.js` | Netrunning: the Net rules and data (`net.js`), decks and programs on the sheet and the player's Net window (`net_player.js`), data fortresses and live runs (`net_gm.js`) |
| `src/med*.js` | Trauma Team: the medical rules, drugs and shared panels (`med.js`), the player's Medical tab, drug lab and bodyshop (`med_player.js`), the GM's downtime and medical tools (`med_gm.js`) |
| `src/cyber*.js` | Cyberlimbs and options, chipware, frames, facedowns and pay (`cyber.js`), the player's Cyberware tab and facedown window (`cyber_player.js`), the GM's side (`cyber_gm.js`) |
| `src/veh*.js` | Vehicles: the catalog, control rolls, control loss, damage and crashes (`veh.js`), the player's Garage and shop option (`veh_player.js`), vehicles in the GM's tracker (`veh_gm.js`) |
| `src/game.js` | How the game registers with Monolith (see the game contract in Monolith's README) |
| `src/build.py` | Builds `dist/game/` (what Monolith loads) and `dist/release/` (the zip and `release.json`) |
| `tests/` | The game's tests, run against a Monolith checkout |

## Working on it

```sh
python3 src/build.py
# run a developer copy of Monolith with this game loaded from the folder:
cd ../monolith && MONOLITH_DEV_GAMES=../monolith-cyberpunk/dist/game npm start
# tests (needs ../monolith built: python3 src/build.py && npm install there)
python3 tests/run_all.py
```

## Releasing

Bump `version` in `game.json`, add a section to `CHANGELOG.md` and push to `main`. The workflow
tests the game against the latest Monolith, signs `release.json` with the Monolith signing key
(the `MONOLITH_SIGNING_KEY` secret) and publishes the release. Monolith installs it the next time
someone opens the game. If a release needs something new from Monolith, raise `minMonolith`:
people are asked to update Monolith before that version installs.

## Third-party components

Rajdhani, Share Tech Mono, Big Shoulders Display, Barlow and IBM Plex Mono: SIL Open Font License 1.1
(licence texts in `src/fonts/`). Cyberpunk 2020 is a trademark of R. Talsorian Games. This is an
unofficial fan tool.
