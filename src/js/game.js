import $ from 'jquery';
import Dexie from 'dexie';
import { phpExecutor } from './languageProviderPhpWasm'
$(document).ready(function () {
    const game = {
        delay: 100,
        questions: [],
        db: {},
        languageToUse: 'php',
        showCorrectAlerts: true,
        level: 1,
        pointsPerCorrectAnswer: 10,
        pointsLostWhenBlockReachesBottom: 1,
        pointsForLevelUp: 50,
        numberOfEachFunction: 4,
        pointsForWin: 200,
        keyCodeForEnterKey: 13,
        totalLevels: $('#available-functions input').length,
        scoreBox: $('#score'),
        newLevelFlag: false,

        init() {
            console.log('init.');
            this.scoreBox.html(0);
            this.setupQuestions();
            this.putQuestionsIntoDatabase();
            this.setupBoard();
        },

        setupBoard() {
            console.log('setupBoard.');
            const board = $('#board');
            board.html('');
            board.off();
            board.click(() => this.togglePause(board));

            $('#count').prop("checked", false);
            $('#count')[0].checked = 'checked';

            return board;
        },

        togglePause(board) {
            console.log('togglePause.');
            $('#options').toggleClass('hidden-options');
            board.toggleClass('paused');
        },

        async finishFallingRandomBlock(block) {
            console.log('finishFallingBlock.');
            this.setInitialBlockPosition(block);
            this.setStopPoint(block);
            block.intervalId = window.setInterval(this.considerMovingBlockDownOnePixel.bind(this, block), this.delay);
            const x =
                $('#instructions').html(

                    `Get ${this.chooseCastTypeAndCastExpectedValueForDisplay(
                        await phpExecutor.executePhpAndGetPrintedResult(block.question.faller + "\n" + block.question.logic),
                        block
                    )} <a href="${block.question.page}" target="_blank" class="documentation">${block.question.instructions}</a>`
                );

            $('#code').on('keypress', (e) => {
                if (e.keyCode === this.keyCodeForEnterKey) {
                    this.trySolution(block);
                }
            });

            $('.documentation').click(() => {
                this.togglePause($('#board'));
            });

            this.manageBlockSpeed(block);
        },

        chooseCastTypeAndCastExpectedValueForDisplay(expected, block) {
            console.log('chooseCastTypeAndCastExpectedValueForDisplay.');
            const castType = block.question.castTo;
            let stringToShow = "";

            switch (castType) {
                case 'int':
                    stringToShow = parseInt(expected);
                    break;
                case 'bool':
                    if (expected === 'true' || expected === 'false') {
                        stringToShow = expected;
                    } else {
                        stringToShow = parseInt(expected) === 1 ? 'true' : 'false';
                    }
                    break;
                case 'string':
                    stringToShow = expected;
                    break;
                case 'array':
                    stringToShow = '';
                    $.each(expected, (key, element) => {
                        stringToShow += ` key: ${key}\n value: ${element}\n`;
                    });
                    break;
                default:
                    alert('Unhandled cast type! Please open a pull request to fix.');
            }
            return stringToShow;
        },

        setInitialBlockPosition(block) {
            console.log('setInitialBlockPosition.');
            const boardWidth = $('#board').width();
            block.offset({
                top: 0,
                left: block.offset().left + (Math.random() - 0.5) * (boardWidth - block.width())
            });
        },

        manageBlockSpeed(block) {
            console.log('manageBlockSpeed.');
            $('#speed').val(100 - this.delay);

            $(document).on('input', '#speed', () => {
                this.delay = 100 - $('#speed').val();
                window.clearInterval(block.intervalId);
                block.intervalId = window.setInterval(this.considerMovingBlockDownOnePixel.bind(this, block), this.delay);
            });
        },

        considerMovingBlockDownOnePixel(block) {
            console.log('considerMovingBlockDownOnePixel.');
            const board = $('#board');
            if (board.hasClass('paused')) {
                return;
            }
            const bottomPieceTop = board.height() - block.height();

            if (block.offset().top < bottomPieceTop && block.offset().top < block.stopPoint - block.height() - 2) {
                block.offset({ top: block.offset().top + 1, left: block.offset().left });
            } else {
                window.clearInterval(block.intervalId);
                if (block.stopPoint < 25) {
                    alert('Game over! Restarting game ...');
                    this.init();
                } else {
                    this.scoreBox.html(parseInt(this.scoreBox.html()) - this.pointsLostWhenBlockReachesBottom);
                    this.clearListenerAndFallNextBlock();
                }
            }
        },

        clearListenerAndFallNextBlock() {
            console.log('clearListenerAndFallNextBlock.');
            $('#code').off();
            $('#code')[0].value = '';
            this.getBlockQuestionAndCreateRandomBlock();
        },

        setStopPoint(block) {
            console.log('setStopPoint');
            const previousStopPoint = $('#board').height();
            block.stopPoint = previousStopPoint;
            const blocks = $('.falling-block');

            blocks.each((i, v) => {
                v = $(v);
                if (block.attr('id') !== v.attr('id')) {
                    const vleft = v.offset().left;
                    const vright = vleft + v.width();
                    const vtop = v.offset().top;
                    if (
                        (block.offset().left < vright && block.offset().left > vleft) ||
                        (block.offset().left + block.width() < vright && block.offset().left + block.width() > vleft)
                    ) {
                        block.stopPoint = vtop;
                    }
                }
            });
        },

        createBlockFromQuestionAndFinishStartingItsFall(allValidQuestionsAsArray) {
            console.log('createBlockFromQuestionAndFinishStartingItsFall');
            const questionNumber = Math.floor(Math.random() * allValidQuestionsAsArray.length);
            const question = allValidQuestionsAsArray[questionNumber];
            const id = Math.round(Math.random() * 100000000);
            $('#board').append(`<div class="falling-block" id="block_${id}"> ... </div>`);
            const block = $(`#block_${id}`);
            block.question = question;
            block.html(block.question.faller);
            this.finishFallingRandomBlock(block);
        },

        getBlockQuestionAndCreateRandomBlock() {
            console.log('getBlockQuestionAndCreateRandomBlock');
            const availableFunctionNames = [];
            $('#available-functions').children('span').each((i, v) => {
                const checkbox = $(v).children('input')[0];
                if (checkbox.checked) {
                    availableFunctionNames[i] = checkbox.id;
                }
            });

            if (this.newLevelFlag) {
                this.db.transaction('r', this.db.questions, async () => {
                    const allValidQuestions = await this.db.questions.where('level').belowOrEqual(this.level).toArray(); this.createBlockFromQuestionAndFinishStartingItsFall(allValidQuestions);
                    this.newLevelFlag = false;
                });
            } else {
                this.db.transaction('r', this.db.questions, async () => {
                    const allValidQuestions = await this.db.questions.where('level').belowOrEqual(this.level).toArray(); this.createBlockFromQuestionAndFinishStartingItsFall(allValidQuestions);
                    this.newLevelFlag = false;
                });
            }
        },



        async trySolution(block) {
            console.log('trySolution.');
            const expected = await phpExecutor.executePhpAndGetPrintedResult(block.question.faller + "\n" + block.question.logic);
            const phpToExecute = block.question.faller + "\n" + $('#code')[0].value;
            const result = await phpExecutor.executePhpAndGetPrintedResult(phpToExecute);
            if (expected === result) {
                this.scoreBox.html(parseInt(this.scoreBox.html()) + this.pointsPerCorrectAnswer);
                block.remove();
                if (parseInt(this.scoreBox.html()) >= this.pointsForLevelUp * this.level) {
                    this.levelUp();
                }
                this.clearListenerAndFallNextBlock();
            }
        },

        levelUp() {
            console.log('levelUp.');
            this.level++;
            this.newLevelFlag = true;
            if (this.level > this.totalLevels) {
                alert('Congratulations! You have beaten the game! Restarting ...');
                this.init();
            }
        },


        setupQuestions: function () {
            console.log('setupQuestions.');
            this.questions.push({
                'level': 1,
                'function': 'count',
                'faller': "$oranges = [15]; \n$apples = 'bob';",
                'instructions': 'using count()',
                'castTo': 'int',
                'logic': 'count($oranges);',
                'page': 'https://www.php.net/manual/en/function.count.php'
            });
            this.questions.push({
                'level': 1,
                'function': 'count',
                'faller': "$dogs = [250]; \n$cats = ['tabby','alley','stray'];",
                'instructions': 'using count()',
                'castTo': 'int',
                'logic': 'count($dogs);',
                'page': 'https://www.php.net/manual/en/function.count.php'
            });
            this.questions.push({
                'level': 1,
                'function': 'count',
                'faller': "$fruits = ['apple','pear']; \n$veggies = ['carrot'];",
                'instructions': 'using count()',
                'castTo': 'int',
                'logic': 'count($fruits);',
                'page': 'https://www.php.net/manual/en/function.count.php'
            });
            this.questions.push({
                'level': 1,
                'function': 'strlen',
                'faller': "$greeting = 'Dobrý den'; \n$sendoffs = ['Ahoj', 'Hezký večer'];",
                'instructions': 'using strlen()',
                'castTo': 'int',
                'logic': 'strlen($greeting);',
                'page': 'https://www.php.net/manual/en/function.count.php'
            });
            this.questions.push({
                'level': 1,
                'function': 'is_array',
                'faller': "$states = ['New York','California']; \n $country = 'USA';",
                'instructions': 'using is_array()',
                'castTo': 'bool',
                'logic': 'is_array($states);',
                'page': 'https://www.php.net/manual/en/function.is-array.php'
            });
            this.questions.push({
                'level': 2,
                'function': 'is_array',
                'faller': "$counties = 'Ingham and Livingston'; \n $country = ['USA'];",
                'instructions': 'using is_array()',
                'castTo': 'bool',
                'logic': 'is_array($counties);',
                'page': 'https://www.php.net/manual/en/function.is-array.php'
            });
            this.questions.push({
                'level': 2,
                'function': 'is_array',
                'faller': "$words = 'A Really Nice Polka'; \n$numbers = [1,2,3,4];",
                'instructions': 'using is_array()',
                'castTo': 'bool',
                'logic': 'is_array($words);',
                'page': 'https://www.php.net/manual/en/function.is-array.php'
            });
            this.questions.push({
                'level': 3,
                'function': 'substr',
                'faller': "$text = '43 apples is too many apples.'; \n$numbers = [1,2,3];",
                'instructions': 'using substr()',
                'castTo': 'string',
                'logic': 'substr($text, 0, 2);',
                'page': 'https://www.php.net/substr'
            });
            this.questions.push({
                'level': 3,
                'function': 'substr',
                'faller': '$text = "43 apples is too many apples.";',
                'instructions': 'using substr()',
                'castTo': 'string',
                'logic': 'substr($text, -7, 6);',
                'page': 'https://www.php.net/substr'
            });
            this.questions.push({
                'level': 3,
                'function': 'substr',
                'faller': '$text = "43 apples is too many apples.";',
                'instructions': 'using substr()',
                'castTo': 'string',
                'logic': 'substr($text, -12);',
                'page': 'https://www.php.net/substr'
            });
            this.questions.push({
                'level': 3,
                'function': 'substr',
                'faller': '$text = "The Day That Larry Learned To Drive";',
                'instructions': 'using substr()',
                'castTo': 'string',
                'logic': 'substr($text, -8, 2);',
                'page': 'https://www.php.net/substr'
            });
            this.questions.push({
                'level': 4,
                'function': 'in_array',
                'faller': '$beatles = ["John","Paul","George","Ringo"]];',
                'instructions': 'using in_array()',
                'castTo': 'bool',
                'logic': 'in_array("John", $beatles);',
                'page': 'https://www.php.net/in_array'
            });
            this.questions.push({
                'level': 4,
                'function': 'in_array',
                'faller': '$cities = ["New York","Paris","Berlin","Tokyo","Lagos"]];',
                'instructions': 'by searching for Boston using in_array()',
                'castTo': 'bool',
                'logic': 'in_array("Boston", $cities);',
                'page': 'https://www.php.net/in_array'
            });
            this.questions.push({
                'level': 4,
                'function': 'in_array',
                'faller': '$composers = ["Fannie Mendelssohn","Moondog", "Ludwig Van Beethoven"]];',
                'instructions': 'using in_array()',
                'castTo': 'bool',
                'logic': 'in_array("Moondog", $composer);',
                'page': 'https://www.php.net/in_array'
            });
            this.questions.push({
                'level': 4,
                'function': 'in_array',
                'faller': '$objects = ["Paper","Rock","Scissors"]];',
                'instructions': 'by searching for glue using in_array()',
                'castTo': 'bool',
                'logic': 'in_array("Glue", $objects);',
                'page': 'https://www.php.net/in_array'
            });
            this.questions.push({
                'level': 5,
                'function': 'explode',
                'faller': '$dances = "polka,foxtrot,chicken";',
                'instructions': 'using count() and explode()',
                'castTo': 'int',
                'logic': 'count(explode(",",$dances));',
                'page': 'https://www.php.net/explode'
            });
            this.questions.push({
                'level': 5,
                'function': 'explode',
                'faller': '$beers = "wheat,stout,helles,dunkel";',
                'instructions': 'using explode()',
                'castTo': 'array',
                'logic': 'explode(",",$beers);',
                'page': 'https://www.php.net/explode'
            });
            this.questions.push({
                'level': 5,
                'function': 'explode',
                'faller': '$beers = "wheat,stout,dunkel,helles";',
                'instructions': 'using explode() and count()',
                'castTo': 'int',
                'logic': 'count(explode(",",$beers));',
                'page': 'https://www.php.net/explode'
            });
            this.questions.push({
                'level': 5,
                'function': 'explode',
                'faller': '$towns = "Vsetín Kalamazoo Xenia";',
                'instructions': 'using explode()',
                'castTo': 'string',
                'logic': 'explode(" ", $towns)[2];',
                'page': 'https://www.php.net/explode'
            });
            this.questions.push({
                'level': 6,
                'function': 'str_replace',
                'faller': '$text = "My Laptop Is Full Of Ham";',
                'instructions': 'using str_replace()',
                'castTo': 'string',
                'logic': 'str_replace("Ham", "Jelly", $text);',
                'page': 'https://www.php.net/str_replace'
            });
            this.questions.push({
                'level': 6,
                'function': 'str_replace',
                'faller': '$text = "Mustard and Toast";',
                'instructions': 'using str_replace()',
                'castTo': 'string',
                'logic': 'str_replace("st", "v", $text);',
                'page': 'https://www.php.net/str_replace'
            });
            this.questions.push({
                'level': 6,
                'function': 'str_replace',
                'faller': '$text = "And That\'s What I Learned In School Today";',
                'instructions': 'using str_replace()',
                'castTo': 'string',
                'logic': 'str_replace("Learned", "Broke", $text);',
                'page': 'https://www.php.net/str_replace'
            });
            this.questions.push({
                'level': 6,
                'function': 'str_replace',
                'faller': '$text = "Well That Is Just Not Very Nice";',
                'instructions': 'using str_replace()',
                'castTo': 'string',
                'logic': 'str_replace("That", "Timmy", $text);',
                'page': 'https://www.php.net/str_replace'
            });
        },
        putQuestionsIntoDatabase: function () {
            console.log('putQuestionsIntoDatabase.');
            var dbName = 'codePlunge';
            this.db = new Dexie(dbName);
            this.db.version(1).stores({
                questions: 'id++,level,functionName,faller,instructions,castTo,logic,page'
            });
            this.db.open().catch(function (e) {
                console.error("Open failed.");
                console.log(e);
            });

            this.db.transaction('rw', this.db['questions'], () => {
                // Use an arrow function to preserve the correct context
                $(this.questions).each((i, v) => {
                    this.db.questions.add({
                        level: v['level'],
                        functionName: v['function'],
                        faller: v['faller'],
                        instructions: v['instructions'],
                        castTo: v['castTo'],
                        logic: v['logic'],
                        page: v['page'],
                        language: 'php' // This can stay here for now, but it should eventually move to our language JSON files.
                    });
                });
            })
                .then(() => {
                    // Use arrow function here as well to maintain the context
                    delete this.questions;
                    this.board = this.setupBoard();
                    this.getBlockQuestionAndCreateRandomBlock();
                    this.newLevelFlag = false;
                })
                .catch((e) => {
                    console.log('transaction failed');
                    console.error('transaction failed.');
                    console.error(e);
                });
        },

    };


    game.init();
});
