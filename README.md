# Code plunge

This is a PARTIALLY COMPLETE game for practicing the use of the most common PHP functions. (More languages coming soon ... ish.)

It is based loosely on Tetris. To play the game, visit http://patrickmaynard.github.io/code-plunge

The game pulls functions to practice from https://www.exakat.io/en/top-100-php-functions/, starting with the most commonly used functions.

The game uses https://github.com/uniter for transpiling PHP into JavaScript.

Apologies for the terrible JavaScript and HTML. I am not a frontend developer these days, so I'm hoping to eventually get some help refactoring.

## TODO items:

* x Make scrollable the area of checkboxes for functions in pause modal
* x Lock the gameplay area to a specific pixel size so scores are competitive
  (Actually, no. To reliably have competitive, server-verified scores, we
  would need to allow users to run arbitrary PHP code on my server, which is
  not something I am prepared to do at this time. So we'll just store personal
  scores in a cookie instead.)
* x Do import of questions into dexie, as part of prep for a move to a DB
* x Move question retrieval to dexie (see TIWIS line), as part of a preparation
  for an eventual move to using a DB
* Clean up CSS a bit
* Get help on seeing if there's a better transpiler to use, since the current one seems to use an old version of PHP. One possible option: https://github.com/seanmorris/php-wasm
* Add a collapsible area that shows the previous answer. Can be shown/hidden via
  a checkbox in the pause screen, with it hidden by default to save screen real
  estate
* Add an MIT license, along with a mention on the home screen of the idea that
  any fees eventually paid for the game are not for the software itself, which
  is free, but for things like early access to new questions
* Remove any old JS functions that are no longer used
* Add 4 more functions from https://www.exakat.io/en/top-100-php-functions/ for the top 10
* Fix the bug in which people can just type a literal or boolean to "answer" the question
* Add a minimal screen resolution check in the css, with screens below a certain
  size yielding a message saying something like "at this time, only desktop
  views of at least 123px by 123px are supported." Make the height of the
  playing area uniform. (The width is already uniform.)
* As preparation for the move from github.io to your personal server (where you'll need to pay for infrastructure), modify the pause screen to show a simple ad
* Get help from someone on refactoring the frontend code
* Create a "(re)start game" button at the bottom
* Move this to your personal server --so you can hook it up to a database for logins, recording of high scores, times, etc.,.-- actually, as having a reliable score that couldn't be fiddled with in the frontend would involve running `eval()` on user-supplied code the server side (which is obviously very unsafe), we'll do away with storing high scores. But we can still maybe serve this from somewhere to de-bloat the github repo. (See below)
* Now that the code is no longer being served directly from GitHub, exclude the NPM package folder from version control
* Add logic that allows the player to see how much time they won the game in
* Add a method for generating a screenshot and posting it to social media along with a score (again, acknowledging somewhere that the scores might be hacked on the frontend)
* Move question definitions to /questions/php.json and make sure the language
  attribute is now being read from that json
* Abstract your dexie logic into a DexieJsonQuestionProvier.js file. This will
  allow more flexibility if we ever decide to change database providers
* Now that you've abstracted things into json, add 5 Python functions and
  recruit for other Python contributors on the NICAR list
* Add more functions -- try to get up to the top 20 in each language!
* Use a native <dialogue> tag for the pause modal, which is pretty bad now
* Fix the bug that causes blocks to occasionally fall through other blocks
* Add 5 more functions to get up to the top 25 functions in each language
* Add storage (via dexie) of personal top scores over time, but with no
  comparison ability, since those scores can't be verified
* Gradually add more PHP functions in groups of 5 until you have all of the
  top 100, adding their Python equivalents as you go
* Consider integrating some of this material as well: https://www.exakat.io/en/top-100-php-classes-that-you-should-know/
* Get help from some devs in other languages on adding support for those languages
* Add any remaining multibyte string functions - https://www.php.net/manual/en/ref.mbstring.php - and other-language equivalents
* Use https://www.npmjs.com/package/dexie-syncable to allow syncing of questions
  from a server-side relational database
* Set up a rudimentary CMS to manage languages and questions, favoring an
  off-the-shelf solution in whichever language your database is currently
  accessed via
* Add any remaining string functions that don't have multibyte equivalents - https://www.php.net/manual/en/ref.strings.php - and other-language equivalents
* Add any remaining array functions - https://www.php.net/manual/en/book.array.php - and other-language equivalents
