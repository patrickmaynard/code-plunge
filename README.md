# Code plunge

This is a game for practicing the use of the most common PHP functions. (More languages coming soon.)

It is based loosely on Tetris. To play the game, visit http://patrickmaynard.github.io/code-plunge 

The game pulls functions to practice from https://www.exakat.io/en/top-100-php-functions/, starting with the most commonly used functions.

The game uses https://github.com/uniter for transpiling PHP into JavaScript.

Apologies for the terrible JavaScript and HTML. I am not a frontend developer these days, so I'm hoping to eventually get some help refactoring.

## TODO items:

* Add 2 more PHP functions, bringing total function count to 8
* Make scrollable the area of checkboxes for functions in pause modal
* Use jQuery UI or some other resource for the pause modal, which is pretty bad now
* Lock the gameplay area to a specific pixel size so scores are competitive
* Clean up CSS a bit
* Add 2 more functions from https://www.exakat.io/en/top-100-php-functions/ for the top 10
* Add a collapsible area that shows the previous answer
* Move question retrieval to dexie, as part of a preparation for an eventual move to MySQL
* Add more functions -- try to get up to the top 20!
* Get help from someone on refactoring the frontend code
* Get help on seeing if there's a better transpiler to use, since the current one seems to use an old version of PHP
* Fix the bug in which people can just type a literal or boolean to "answer" the question
* As preparation for the move from github.io to your personal server (where you'll need to pay for infrastructure), modify the pause screen to show a simple ad
* Create a "(re)start game" button at the bottom
* Move this to your personal server so you can hook it up to a database for logins, recording of high scores, times, etc.,.
* Now that the code is no longer being served directly from GitHub, exclude the NPM package folder from version control
* Fix bug that causes blocks to occasionally fall through other blocks
* Add logic that allows the player to see how much time they won the game in
* Fix bug that causes falling blocks to push the pause modal into the background
* Add a method for generating a screenshot and posting it to social media along with a score
* Add 5 more functions to get up to the top 25 PHP functions
* Add Python equivalents of the PHP functions you currently have
* Gradually add more PHP functions in groups of 5 until you have all of the top 100
* Consider integrating some of this material as well: https://www.exakat.io/en/top-100-php-classes-that-you-should-know/
* Get help from some devs in other languages on adding support for those languages
