# DUELBOY - Rock Paper Scissors

A retro handheld-style Rock Paper Scissors game built with plain HTML, CSS, and JavaScript.

## Features

- Pixel-style console UI inspired by classic handheld games
- Two game modes:
- Quick Match (endless rounds with streak tracking)
- Contest (10-round match with final result)
- Leaderboard backed by browser `localStorage`
- Round animations (screen flash + console shake)
- Responsive layout for desktop and mobile
- Keyboard-accessible main menu items

## Project Structure

- `index.html` - Main UI markup and views (Home, Quick Match, Contest, Leaderboard)
- `style.css` - Retro visual theme, layout, and animations
- `script.js` - Game logic, mode routing, scoring, and leaderboard storage

## How To Run

1. Download or clone this project.
2. Open `index.html` in any modern browser.

No build tools or dependencies are required.

## How To Play

1. Start on the **SELECT MODE** screen.
2. Choose one of the modes:
- **Quick Match**: play unlimited rounds against CPU.
- **Contest (10 RD)**: play 10 rounds, then see your final result.
- **Leaderboard**: view top contest entries.
3. Use the move buttons:
- ROCK
- PAPER
- SCSR (Scissors)
4. Use **RESET** to reset the current mode state.
5. Use the home button to return to the main menu.

## Leaderboard Behavior

- Contest results are saved in browser `localStorage` under key `duelboy-leaderboard`.
- The leaderboard displays up to top 10 entries.
- **CLEAR ALL DATA** removes saved leaderboard data.

## Controls & UI Notes

- Main menu items can be activated with mouse or keyboard (`Enter` / `Space`).
- Move buttons are temporarily disabled during throw animation to prevent double inputs.

## Credits

Built by [Ronak Sarda](https://github.com/ronaksarda/rock-paper-scissor-cosc).
