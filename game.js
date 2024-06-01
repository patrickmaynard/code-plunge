

//No, seriously, did I mention I'm not a frontend developer?


$(document).ready(function(){
    let game = {

        init: function () {
            that = this;
            that.delay = 100; //How many milliseconds between pixel moves
            that.questions = [];
            that.db = {};
            that.languageToUse = 'php'; //Can be hardcoded here for now
            that.showCorrectAlerts = true;
            that.level = 1;
            that.pointsPerCorrectAnswer = 10;
            that.pointsLostWhenBlockReachesBottom = 1;
            that.pointsForLevelUp = 50; //Every n points, we level up by adding a new function
            that.numberOfEachFunction = 4; //How many examples of each function are there?
            that.pointsForWin = that.pointsForLevelUp * that.numberOfEachFunction;
            that.scoreBox = $($('#score')[0]);
            that.scoreBox.html(0);
            that.keyCodeForEnterKey = 13;
            that.totalLevels = $('#available-functions input').length;
            that.setupQuestions();
            that.putQuestionsIntoDatabase(); //This feels redundant for now. But if we build this out, it won't be.
            that.board = that.setupBoard();
            that.fallRandomBlock();
            that.newLevelFlag = false;
        },

        setupBoard: function() {
            let board = $($('#board'));
            board.html('');
            board.off();
            board.click(function(){
                that.togglePause(board);
            });
            $('#count').prop("checked", false);
            $('#count')[0].checked = 'checked';

            return board;
        },

        togglePause: function(board) {
            $('#options').toggleClass('hidden-options');
            board.toggleClass('paused');
        },

        fallRandomBlock: function() {
            const block = that.createRandomBlock();
            that.setInitialBlockPosition(block);
            that.setStopPoint(block);
            block.intervalId = window.setInterval(that.considerMovingBlockDownOnePixel, that.delay, block);


            //TODO: Figure out why the instructions ALWAYS say "using count()" even when only the last function checkbox is checked.


            $('#instructions')[0].innerHTML =
                'Get ' +
                that.chooseCastTypeAndCastExpectedValueForDisplay(
                    that.executePhpAndGetPrintedResult(
                        block.question.faller + "\n" + block.question.logic
                    ),
                    block
                ) +
                ' <a href="' +
                block.question.page +
                '" target="_blank" class="documentation">' +
                block.question.instructions +
                '</a>'
            ;
            $('#code').bind('keypress', function(e) {
                if (e.keyCode == that.keyCodeForEnterKey) {
                    that.trySolution(block);
                }
            });
            $('.documentation').click(function(){
                that.togglePause(that.board);
            });
            that.manageBlockSpeed(block);
            return block;
        },

        chooseCastTypeAndCastExpectedValueForDisplay: function(expected, block) {
            const castType = block.question.castTo;
            var stringToShow = "";

            switch (castType) {
                case 'int':
                    stringToShow = parseInt(expected);
                    break;
                case 'bool':
                    if (parseInt(expected) === 1) {
                        stringToShow = 'true';
                    } else {
                        stringToShow = 'false';
                    }
                    break;
                case 'string':
                    stringToShow = expected;
                    break;
                case 'array':
                    stringToShow = '';
                    $.each(expected, function(key, element) {
                        stringToShow += ' key: ' + key + '\n' + 'value: ' + element + '\n';
                    });
                    break;
                default:
                    alert('Unhandled cast type! Please open a pull request to fix.');
            }
            return stringToShow;
        },

        setInitialBlockPosition: function(block) {
            const boardWidth = $($('#board')[0]).width();
            block.offset(
                {
                    top: 0,
                    left: block.offset().left + (Math.random() - .5) * (boardWidth - block.width())
                }
            );
        },

        manageBlockSpeed: function(block) {
            $('#speed')[0].value = 100 - that.delay;
            $(document).on('input', '#speed', function() {
                //alert('Changed');
                that.delay = 100 - $(this).val();
                window.clearInterval(block.intervalId);
                block.intervalId = window.setInterval(that.considerMovingBlockDownOnePixel, that.delay, block);
            });
        },

        considerMovingBlockDownOnePixel: function(block) {
            let board = $($('#board')[0]);
            if (board.hasClass('paused')) {
                return;
            }
            blockId = block.attr('id');
            const bottomPieceTop = $($('#board')[0]).height() - block.height();
            if (

                block.offset().top < bottomPieceTop &&
                block.offset().top < block.stopPoint - block.height() - 2
            ) {
                //It's been a second (or whatever our delay is).
                //Move the box down a pixel.
                block.offset(
                    {
                        top: block.offset().top + 1,
                        left: block.offset().left
                    }
                );
            } else {
                window.clearInterval(block.intervalId);
                if (block.stopPoint < 25) {
                    //The blocks have reached the top of the board. The player has lost.
                    alert('Game over! Restarting game ...');
                    that.init();
                } else {
                    //The block has reached the bottom (or is resting on another block).
                    //Decrement the score by a small amount and fall another block.
                    that.scoreBox.html(parseInt(that.scoreBox.html()) - that.pointsLostWhenBlockReachesBottom);
                    that.clearListenerAndFallNextBlock();
                }
            }
        },

        clearListenerAndFallNextBlock: function() {
            $('#code').off();
            $('#code')[0].value = '';
            that.fallRandomBlock();
        },

        setStopPoint: function(block) {
            const previousStopPoint = $($('#board')[0]).height();
            block.stopPoint = previousStopPoint;
            blocks = $('.falling-block');
            blocks.each(function(i,v) {
                v = $(v);
                if (block.attr('id') !== v.attr('id')) {
                    vleft = v.offset().left;
                    vright = vleft + v.width();
                    vtop = v.offset().top;
                    if (
                        (
                            (block.offset().left < vright && block.offset().left > vleft) ||
                            (block.offset().left + block.width() < vright && block.offset().left + block.width() > vleft)
                        ) &&
                        vtop < previousStopPoint
                    ) {
                        block.stopPoint = vtop;
                    }
                }
            });
        },

        createRandomBlock: function() {
            const id = Math.round(Math.random() * 100000000);
            $('#board')[0].innerHTML += '<div class="falling-block" id="block_'+id+'"> ... </div>';
            const block = $($('#block_'+id)[0]);
            block.question = that.getBlockQuestion();
            console.log(block);
            console.log(block.question);
            block.html(block.question.faller);
            return(block);
        },

        getBlockQuestion: function() {
           //New behavior (partially built -- the availableFunctionNames array is now being reliably populated.
           //The next step is to do a dexie query for all applicable questions and select a random question.
           //After that, we would want to return that random question.
           //Finally, we want to TEST this new behavior extremely thoroughly, using both manual and automated tests.
            availableFunctionNames = [];
            $('#available-functions').children('span').each(function(i,v){
              let checkbox = $(v).children('input')[0];
              if (checkbox.checked) {
                availableFunctionNames[i] = checkbox.id;
              }
            });
          //TIWIS - Now do the query.


          //Old behavior
            if (!that.newLevelFlag) {
                var questionNumber = Math.floor(Math.random() * (that.questions.length));
            } else {
                //This is a new level.
                var questionNumber = that.level * that.numberOfEachFunction - 1;
                that.newLevelFlag = false;
            }
            if ($('#'+that.questions[questionNumber]['function']).is(':checked')){
                return that.questions[questionNumber];
            } else {
                return that.getBlockQuestion();
            }
        },

        //Note that this method automatically "prints" the last expression.
        //That "print" output is then returned as a string.
        executePhpAndGetPrintedResult: function(partialPhpToExecute) {
            const phpEngine = uniter.createEngine('PHP');
            var fullPhpToExecute  = "<?php\n";
            var returnedData  = "";
            var fullPhpToExecuteParts = [];
            var lastElement = {};
            var lastCharacter = "";
            fullPhpToExecute += partialPhpToExecute;
            fullPhpToExecuteParts = fullPhpToExecute.split("\n");
            lastElement = $(fullPhpToExecuteParts).get(-1);
            lastElement = "print (string) " + lastElement;
            fullPhpToExecuteParts.pop();
            fullPhpToExecuteParts.push(lastElement);
            fullPhpToExecute = fullPhpToExecuteParts.join("\n");
            lastCharacter = fullPhpToExecute.substr(fullPhpToExecute.length - 1);
            if (lastCharacter !== ';') {
                fullPhpToExecute += ';';
            }
            phpEngine.getStdout().on('data', function (data) {
                returnedData = data;
            });
            phpEngine.execute(fullPhpToExecute, 'my_script.php');
            console.log(fullPhpToExecute);
            return returnedData;
        },

        trySolution: function(block) {
            const expected = that.executePhpAndGetPrintedResult(
                block.question.faller + "\n" + block.question.logic
            );
            const phpToExecute = block.question.faller + "\n" + $('#code')[0].value;
            const result = that.executePhpAndGetPrintedResult(phpToExecute);
            console.log('Expected: ' + expected);
            console.log('Result: ' + result);
            if (expected === result) {
                that.scoreBox.html(parseInt(that.scoreBox.html()) + that.pointsPerCorrectAnswer);
                block.remove();
                if (parseInt(that.scoreBox.html()) >= that.pointsForLevelUp * that.level) {
                    that.levelUp();
                }
                that.clearListenerAndFallNextBlock();
            }
        },

        levelUp: function() {
            that.level ++;
            that.newLevelFlag = true;
            console.log('We have just leveled up. New level:');
            console.log(that.level);
            if (that.level > that.totalLevels) {
                alert('Congratulations! You have beaten the game! Restarting ...');
                that.init();
            }
            const functionName = that.questions[that.numberOfEachFunction * (that.level - 1)]['function'];
            if ($('#auto-add-functions').is(':checked')) {
                $('#' + functionName)[0].checked = 'checked';
            }
        },

        setupQuestions: function() {
            that.questions.push({
                'function' : 'count',
                'faller' : "$oranges = 15; \n$apples = 'bob';",
                'instructions' : 'using count()',
                'castTo' : 'int',
                'logic' : 'count($oranges);',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'count',
                'faller' : "$dogs = 250; \n$cats = ['tabby','alley','stray'];",
                'instructions' : 'using count()',
                'castTo' : 'int',
                'logic' : 'count($dogs);',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'count',
                'faller' : "$fruits = ['apple','pear']; \n$veggies = ['carrot'];",
                'instructions' : 'using count()',
                'castTo' : 'int',
                'logic' : 'count($fruits);',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'count',
                'faller' : "$greeting = 'Dobrý den'; \n$sendoffs = ['Ahoj', 'Hezký večer'];",
                'instructions' : 'using count()',
                'castTo' : 'int',
                'logic' : 'count($greeting);',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : "$states = ['New York','California']; \n $country = 'USA';",
                'instructions' : 'using is_array()',
                'castTo' : 'bool',
                'logic' : 'is_array($states);',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : "$counties = 'Ingham and Livingston'; \n$country = ['USA'];",
                'instructions' : 'using is_array()',
                'castTo' : 'bool',
                'logic' : 'is_array($counties);',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : "$states = (object) ['name' => 'California']; \n$countries = ['name' => 'USA'];",
                'instructions' : 'using is_array()',
                'castTo' : 'bool',
                'logic' : 'is_array($states);',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : "$words = 'A Really Nice Polka'; \n$numbers = [1,2,3,4];",
                'instructions' : 'using is_array()',
                'castTo' : 'bool',
                'logic' : 'is_array($words);',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
            that.questions.push({
                'function' : 'substr',
                'faller' : "$text = '43 apples is too many apples.'; \n$numbers = [1,2,3];",
                'instructions' : 'using substr()',
                'castTo' : 'string',
                'logic' : 'substr($text, 0, 2);',
                'page' : 'https://www.php.net/substr'
            });
            that.questions.push({
                'function' : 'substr',
                'faller' : '$text = "43 apples is too many apples.";',
                'instructions' : 'using substr()',
                'castTo' : 'string',
                'logic' : 'substr($text, -7, 6);',
                'page' : 'https://www.php.net/substr'
            });
            that.questions.push({
                'function' : 'substr',
                'faller' : '$text = "43 apples is too many apples.";',
                'instructions' : 'using substr()',
                'castTo' : 'string',
                'logic' : 'substr($text, -12);',
                'page' : 'https://www.php.net/substr'
            });
            that.questions.push({
                'function' : 'substr',
                'faller' : '$text = "The Day That Larry Learned To Drive";',
                'instructions' : 'using substr()',
                'castTo' : 'string',
                'logic' : 'substr($text, -8, 2);',
                'page' : 'https://www.php.net/substr'
            });
            that.questions.push({
                'function' : 'in_array',
                'faller' : '$beatles = ["John","Paul","George","Ringo"]];',
                'instructions' : 'using in_array()',
                'castTo' : 'bool',
                'logic' : 'in_array("John", $beatles);',
                'page' : 'https://www.php.net/in_array'
            });
            that.questions.push({
                'function' : 'in_array',
                'faller' : '$cities = ["New York","Paris","Berlin","Tokyo","Lagos"]];',
                'instructions' : 'by searching for Boston using in_array()',
                'castTo' : 'bool',
                'logic' : 'in_array("Boston", $cities);',
                'page' : 'https://www.php.net/in_array'
            });
            that.questions.push({
                'function' : 'in_array',
                'faller' : '$composers = ["Fannie Mendelssohn","Moondog", "Ludwig Van Beethoven"]];',
                'instructions' : 'using in_array()',
                'castTo' : 'bool',
                'logic' : 'in_array("Moondog", $composer);',
                'page' : 'https://www.php.net/in_array'
            });
            that.questions.push({
                'function' : 'in_array',
                'faller' : '$objects = ["Paper","Rock","Scissors"]];',
                'instructions' : 'by searching for glue using in_array()',
                'castTo' : 'bool',
                'logic' : 'in_array("Glue", $objects);',
                'page' : 'https://www.php.net/in_array'
            });
            that.questions.push({
                'function' : 'explode',
                'faller' : '$dances = "polka,foxtrot,chicken";',
                'instructions' : 'using count() and explode()',
                'castTo' : 'int',
                'logic' : 'count(explode(",",$dances));',
                'page' : 'https://www.php.net/explode'
            });
            that.questions.push({
                'function' : 'explode',
                'faller' : '$beers = "wheat,stout,helles,dunkel";',
                'instructions' : 'using explode()',
                'castTo' : 'array',
                'logic' : 'explode(",",$beers);',
                'page' : 'https://www.php.net/explode'
            });
            that.questions.push({
                'function' : 'explode',
                'faller' : '$beers = "wheat,stout,dunkel,helles";',
                'instructions' : 'using explode() and count()',
                'castTo' : 'int',
                'logic' : 'count(explode(",",$beers));',
                'page' : 'https://www.php.net/explode'
            });
            that.questions.push({
                'function' : 'explode',
                'faller' : '$towns = "Vsetín Kalamazoo Xenia";',
                'instructions' : 'using explode()',
                'castTo' : 'string',
                'logic' : 'explode(" ", $towns)[2];',
                'page' : 'https://www.php.net/explode'
            });
            that.questions.push({
                'function' : 'str_replace',
                'faller' : '$text = "My Laptop Is Full Of Ham";',
                'instructions' : 'using str_replace()',
                'castTo' : 'string',
                'logic' : 'str_replace("Ham", "Jelly", $text);',
                'page' : 'https://www.php.net/str_replace'
            });
            that.questions.push({
                'function' : 'str_replace',
                'faller' : '$text = "Mustard and Toast";',
                'instructions' : 'using str_replace()',
                'castTo' : 'string',
                'logic' : 'str_replace("st", "v", $text);',
                'page' : 'https://www.php.net/str_replace'
            });
            that.questions.push({
                'function' : 'str_replace',
                'faller' : '$text = "And That\'s What I Learned In School Today";',
                'instructions' : 'using str_replace()',
                'castTo' : 'string',
                'logic' : 'str_replace("Learned", "Broke", $text);',
                'page' : 'https://www.php.net/str_replace'
            });
            that.questions.push({
                'function' : 'str_replace',
                'faller' : '$text = "Well That Is Just Not Very Nice";',
                'instructions' : 'using str_replace()',
                'castTo' : 'string',
                'logic' : 'str_replace("That", "Timmy", $text);',
                'page' : 'https://www.php.net/str_replace'
            });
        },

        putQuestionsIntoDatabase: function() {
            var dbName = 'codePlunge';
            that.db = new Dexie(dbName);
            that.db.version(1).stores({
              questions: 'id++,function,faller,instructions,castTo,logic,page'
            });
            that.db.open().catch(function (e) {
              console.error("Open failed.");
              console.log(e);
            })
            that.db.transaction('rw', that.db['questions'], function () {
            $(that.questions).each(function(i,v){
              that.db.questions.add({
                functionName: v['function'],
                faller: v['faller'],
                instructions: v['instructions'],
                castTo: v['castTo'],
                logic: v['logic'],
                page: v['page'],
                language: 'php' //This can stay here for now, but it should eventually move to our language JSON files.
              });
            });
            }).catch (function (e) {
              console.error('transaction failed.');
              console.error(e);
            });
        },
    };

    game.init();
});
