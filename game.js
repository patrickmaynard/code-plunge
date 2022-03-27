$(document).ready(function(){
    const game = {

        init: function () {
            that = this;
            that.delay = 100; //How many miliseconds between pixel moves
            that.questions = [];
            that.showCorrectAlerts = true;
            that.initQuestions();
            $('#board')[0].innerHTML = '';
            that.fallRandomBlock();
            $('#score')[0].innerHTML = '0';
        },

        fallRandomBlock: function() {
            const block = that.createRandomBlock();
            that.setInitialBlockPosition(block);
            that.setStopPoint(block);
            block.intervalId = window.setInterval(that.considerMovingBlockDownOnePixel, that.delay, block)
            $('#instructions')[0].innerHTML = block.question.instructions + ' with ' + block.question.function + '()';
            $('#code').keyup(function(){
                that.trySolution(block);
            });
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

        considerMovingBlockDownOnePixel: function(block) {
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
            const randomizedQuestionNumber = Math.floor(Math.random() * 4);
            block.question = that.questions[randomizedQuestionNumber];
            console.log(block.question);
            block.html(block.question.faller);
            return(block);
        },

        trySolution: function(block) {
            const expected = block.question.expected;
            //castString = "(" + block.question.castTo + ")";
            castString = "(string)";
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
                    $('#score')[0].innerHTML = parseInt($('#score')[0].innerHTML) + 10;
                    block.remove();
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

        initQuestions: function() {
            that.questions.push({
                'function' : 'count',
                'faller' : '$oranges = 15;',
                'instructions' : 'Get the number 1',
                'expected' : 1,
                'castTo' : 'int',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'count',
                'faller' : '$dogs = 250;',
                'instructions' : 'Get the number 1',
                'expected' : 1,
                'castTo' : 'int',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'count',
                'faller' : '$fruits = ["apple","pear"];',
                'instructions' : 'Get the number 2',
                'expected' : 2,
                'castTo' : 'int',
                'page' : 'https://www.php.net/manual/en/function.count.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : '$states = ["New York","California"];',
                'instructions' : 'Get the boolean <br>true</b> (or int equivalent 1)',
                'expected' : 1,
                'castTo' : 'int',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
            that.questions.push({
                'function' : 'is_array',
                'faller' : '$states = "Rhode Island and Michigan";',
                'instructions' : 'Get the boolean <br>false</b> (or int equivalent 1)',
                'expected' : 0,
                'castTo' : 'int',
                'page' : 'https://www.php.net/manual/en/function.is-array.php'
            });
        },

    };

    game.init();
});