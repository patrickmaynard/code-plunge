# Code plunge

This is a game for practicing the use of the most common PHP functions. (More languages coming soon.)

It is based loosely on Tetris. To play the game, visit http://patrickmaynard.github.io/code-plunge 

The game pulls functions to practice from https://www.exakat.io/en/top-100-php-functions/, starting with the most commonly used functions.

The game uses https://github.com/uniter for transpiling PHP into JavaScript.

Apologies for the terrible JavaScript and HTML. I am not a frontend developer these days, so I'm hoping to eventually get some help refactoring.

## TODO items:

* Add a few more functions from https://www.exakat.io/en/top-100-php-functions/
* Add links to the man pages
* Clean up CSS a bit
* Add more functions -- try to get up to the top 20!
* Get help from someone on refactoring the frontend code
* Add checkboxes on the pause screen for choosing which functions to practice. Unless a checkbox has been manually checked, the functions should be gradually added automatically
* Get help from some devs in other languages on adding support for additional languages
* Create a "(re)start game" button at the bottom
* Move this to your personal server so you can hook it up to a database for logins, recording of high scores, etc.,.
* Now that the code is no longer being served directly from GitHub, exclude the NPM package folder from version control
* Fix bug that causes blocks to occasionally fall through other blocks
* Fix bug that causes falling blocks to push the pause modal into the background
