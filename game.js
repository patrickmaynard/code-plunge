$(document).ready(function(){
    const game = {

        init: function () {
            that = this;
            that.delay = that.delay !== undefined ? that.delay : 100; //How many milliseconds between pixel moves
            that.questions = [];
            that.showCorrectAlerts = true;
            that.level = 1;
            that.pointsForLevelUp = 50; //Every n points, we level up by adding a new function
            that.numberOfEachFunction = 4; //How many examples of each function are there?
            that.pointsForWin = that.pointsForLevelUp * that.numberOfEachFunction;
            that.scoreBox = $($('#score')[0]);
            that.scoreBox.html(0);
            that.setupQuestions();
            that.setupBoard();
            that.fallRandomBlock();
        },

        setupBoard: function() {
            let board = $($('#board'));
            board.html('');
            board.off();
            board.click(function(){
                $('#options').toggleClass('hidden-options');
                board.toggleClass('paused');
            });
        },

        fallRandomBlock: function() {
            const block = that.createRandomBlock();
            that.setInitialBlockPosition(block);
            that.setStopPoint(block);
            block.intervalId = window.setInterval(that.considerMovingBlockDownOnePixel, that.delay, block);
            $('#instructions')[0].innerHTML = block.question.instructions + ' with ' + block.question.function + '()';
            $('#code').bind('keypress', function(e) {
                if (e.keyCode == 13) {
                    that.trySolution(block);
                }
            });
            that.manageBlockSpeed(block);
            return block;
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
                    alert('Game over! Restarting game ...');
                    that.init();
                } else {
                    that.clearListenerAndFallNextBlock()
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
            const randomizedQuestionNumber = Math.floor(Math.random() * (that.numberOfEachFunction * that.level));
            block.question = that.questions[randomizedQuestionNumber];
            console.log(block.question);
            block.html(block.question.faller);
            return(block);
        },

        trySolution: function(block) {
            const expected = block.question.expected;
            //castString = "(" + block.question.castTo + ")";
            castString = "(string)" + "(" + block.question.castTo + ")";
            var phpToExecute  = "<?php\n";
                phpToExecute += block.question.faller + "\n";
                phpToExecute += "print " + castString + $('#code')[0].value  + ";\n";
                console.log(phpToExecute);
            var phpEngine = uniter.createEngine('PHP');
            phpEngine.getStdout().on('data', function (data) {
                console.log('Data:');
                console.log(data);
                const originalData = data;
                data = block.question.castTo === 'int' ? parseInt(data) : data;
                if (data === block.question.expected) {
                    if (that.showCorrectAlerts) {
                        alert(
                            'Correct! The '
                            + block.question.function
                            +'() method returned '
                            + originalData + '.'
                        );
                    }

                    that.scoreBox.html(parseInt(that.scoreBox.html()) + 10);
                    let scoreValue = that.scoreBox.html();
                    block.remove();
                    that.delay --;
                    if (scoreValue % that.pointsForLevelUp === 0 && scoreValue < that.pointsForWin) {
                        //Every n points, level up by adding a function
                        that.level ++;
                    }
                    that.clearListenerAndFallNextBlock();
                } else {
                    console.log('Unexpected result:');
                    console.log(data);
                }
            });
            phpEngine.execute(phpToExecute, '').fail(function (error) {
                console.log('PHP error!');
                console.log(error.toString());
            });
        },

        setupQuestions: function() {
            that.questions.push({
                'function' : 'count',
                'faller' : "$oranges = 15; \n$apples = 'bob';",
                'instructions' : 'Get the number 1',
                'expected' : 1,
                'castTo' : 'int',
                'logic' : 'count($oranges);',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'count',
                'faller' : "$dogs = 250; \n$cats = ['tabby','alley','stray'];",
                'instructions' : 'Get the number 1',
                'expected' : 1,
                'castTo' : 'int',
                'logic' : 'count($dogs);',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'count',
                'faller' : "$fruits = ['apple','pear']; \n$veggies = ['carrot'];",
                'instructions' : 'Get the number 2',
                'expected' : 2,
                'castTo' : 'int',
                'logic' : 'count($fruits);',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'count',
                'faller' : "$greeting = 'Dobrý den'; \n$sendoffs = ['Ahoj', 'Hezký večer'];",
                'instructions' : 'Get the number 1',
                'expected' : 1,
                'castTo' : 'int',
                'logic' : 'count($greeting);',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : "$states = ['New York','California']; \n $country = 'USA';",
                'instructions' : 'Get the boolean <br>true</b> (or int equivalent 1)',
                'expected' : 1,
                'castTo' : 'int',
                'logic' : 'is_array($states);',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : "$counties = 'Ingham and Livingston'; \n$country = ['USA'];",
                'instructions' : 'Get the boolean <br>false</b> (or int equivalent 0)',
                'expected' : 0,
                'castTo' : 'int',
                'logic' : 'is_array($counties);',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : "$states = (object) ['name' => 'California']; \n$countries = ['name' => 'USA'];",
                'instructions' : 'Get the boolean <br>false</b> (or int equivalent 0)',
                'expected' : 0,
                'castTo' : 'int',
                'logic' : 'is_array($states);',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : "$words = 'A Really Nice Polka'; \n$numbers = [1,2,3,4];",
                'instructions' : 'Get the boolean <br>false</b> (or int equivalent 0)',
                'expected' : 0,
                'castTo' : 'int',
                'logic' : 'is_array($words);',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
            that.questions.push({
                'function' : 'substr',
                'faller' : "$text = '43 apples is too many apples.'; \n$numbers = [1,2,3];",
                'instructions' : 'Get the string "43"',
                'expected' : '43',
                'castTo' : 'string',
                'logic' : 'substr($text, 0, 2);',
                'page' : 'https://www.php.net/substr'
            });
            that.questions.push({
                'function' : 'substr',
                'faller' : '$text = "43 apples is too many apples.";',
                'instructions' : 'Get the string "apples"',
                'expected' : 'apples',
                'castTo' : 'string',
                'logic' : 'substr($text, -7, 6);',
                'page' : 'https://www.php.net/substr'
            });
            that.questions.push({
                'function' : 'substr',
                'faller' : '$text = "43 apples is too many apples.";',
                'instructions' : 'Get the string "many apples."',
                'expected' : 'many apples.',
                'castTo' : 'string',
                'logic' : 'substr($text, -12);',
                'page' : 'https://www.php.net/substr'
            });
            that.questions.push({
                'function' : 'substr',
                'faller' : '$text = "The Day That Larry Learned To Drive";',
                'instructions' : 'Get the string "To"',
                'expected' : 'To',
                'castTo' : 'string',
                'logic' : 'substr($text, -8, 2);',
                'page' : 'https://www.php.net/substr'
            });
            that.questions.push({
                'function' : 'in_array',
                'faller' : '$beatles = ["John","Paul","George","Ringo"]];',
                'instructions' : 'Get the boolean <br>true</b> (or int equivalent 1)',
                'expected' : 1,
                'castTo' : 'int',
                'logic' : 'in_array("John", $beatles);',
                'page' : 'https://www.php.net/in_array'
            });
            that.questions.push({
                'function' : 'in_array',
                'faller' : '$cities = ["New York","Paris","Berlin","Tokyo","Lagos"]];',
                'instructions' : 'Get the boolean <br>false</b> (or int equivalent 0) by searching for Boston',
                'expected' : 0,
                'castTo' : 'int',
                'logic' : 'in_array("Boston", $cities);',
                'page' : 'https://www.php.net/in_array'
            });
            that.questions.push({
                'function' : 'in_array',
                'faller' : '$composers = ["Fannie Mendelssohn","Moondog", "Ludwig Van Beethoven"]];',
                'instructions' : 'Get the boolean <br>true</b> (or int equivalent 1)',
                'expected' : 1,
                'castTo' : 'int',
                'logic' : 'in_array("Moondog", $composer);',
                'page' : 'https://www.php.net/in_array'
            });
            that.questions.push({
                'function' : 'in_array',
                'faller' : '$objects = ["Paper","Rock","Scissors"]];',
                'instructions' : 'Get the boolean <br>false</b> (or int equivalent 0) by searching for glue',
                'expected' : 0,
                'castTo' : 'int',
                'logic' : 'in_array("Glue", $objects);',
                'page' : 'https://www.php.net/in_array'
            });
        },

    };

    game.init();
});