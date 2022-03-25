$(document).ready(function(){
    const game = {

        init: function () {
            that = this;
            that.delay = 25; //How many miliseconds between pixel moves
            that.blockHeight = 18;
            that.bottomPieceTop = $($('#board')[0]).height() - that.blockHeight;
            that.questions = {};
            that.initQuestions();
            $('#board')[0].innerHTML = '';
            that.fallRandomBlock();
            $('#code').keyup(that.trySolution);
        },

        fallRandomBlock: function() {
            const blockId = that.createRandomBlock();
            that.setInitialBlockPosition(blockId);
            const block = $($('#block_'+blockId));
            that.setStopPoint(block);
            that.attachQuestion(block);
            block.intervalId = window.setInterval(that.considerMovingBlockDownOnePixel, that.delay, block);
        },

        setInitialBlockPosition: function(blockId) {
            const block = $($('#block_'+blockId)[0]);
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
            if (
                block.offset().top < that.bottomPieceTop &&
                block.offset().top < block.stopPoint - that.blockHeight - 2
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
                    that.fallRandomBlock();
                }
            }
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
                    //alert(that.blockHeight);
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
            return(id);
        },

        trySolution: function() {
            alert('Trying solution!');
        },

        attachQuestion: function(block) {
            alert('Stub for attaching questions!');
        },

        initQuestions: function() {
            that.questions[0] = {
                'function' : 'count',
                'faller' : '$oranges = 15',
                'instructions' : 'Get the number 15 with count()',
                'expected' : 15
            };
            that.questions[1] = {
                'function' : 'count',
                'faller' : '$dogs = 250',
                'instructions' : 'Get the number 250 with count()',
                'expected' : 250
            };
            that.questions[1] = {
                'function' : 'count',
                'faller' : '$fruits = ["apple","pear"]',
                'instructions' : 'Get the number 2 with count()',
                'expected' : 2
            };
        },

    };

    game.init();

});