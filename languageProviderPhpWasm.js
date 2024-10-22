
//This is currently just a generic object.
//Later, I can get fancy with an "export" keyword, a class definition, etc.,.
//That comes once I get this project onto an actual server instead of having it served entirely via GitHub.


import { PhpCgiWorker } from "php-cgi-wasm/PhpCgiWorker";




var phpWasmExecutor = {

    //Note that this method automatically "prints" the last expression.
    //That "print" output is then returned as a string.
    executePhpAndGetPrintedResult: function(partialPhpToExecute) {

    const php = new PhpCgiWorker({
        prefix:  '/php-wasm',
        docroot: '/persist/www',
        types: {
            jpg:  'image/jpeg',
            jpeg: 'image/jpeg',
            gif:  'image/gif',
            png:  'image/png',
            svg:  'image/svg+xml',
        }
    });





        console.log('executePhpAndGetPrintedResult.');
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
        return returnedData;
    }
}
