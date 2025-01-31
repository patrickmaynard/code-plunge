import { PhpWeb } from "/node_modules/.vite/deps/php-wasm_PhpWeb__mjs.js?v=e0fa5db0";

export const phpExecutor = {
    executePhpAndGetPrintedResult: async function (partialPhpToExecute) {
        console.log('Executing PHP code...');
        const php = new PhpWeb({
            locateFile: (file) => `/wasm-files/${file}`
        });

    await new Promise(resolve => php.addEventListener('ready', resolve));
        console.log("WASM module is ready");

        let lines = partialPhpToExecute.trim().split("\n");

        let lastLine = lines.pop().trim();

        if (lastLine.endsWith(";")) {
            lastLine = lastLine.slice(0, -1);
        }


        // check if the last line contains `is_array(`
        if (lastLine.includes("is_array(")) {
            // Modify the line to append `: true false`
            lastLine = `print((${lastLine} ? "true" : "false"));`;
        } else {
            // Wrap the last line in `print()`
            lastLine = `print(${lastLine});`;
        }

        lines.push(lastLine);
        let fullPhpToExecute = `<?php\n${lines.join("\n")}\n?>`;

        try {
            let output = '';
            const outputPromise = new Promise((resolve, reject) => {
                php.addEventListener('output', (event) => {
                    output += event.detail;
                    console.log('Captured output:', event.detail);
                    resolve(output.trim());
                });
            });

            console.log("Running PHP code...");
            await php.run(fullPhpToExecute);

            return await outputPromise;

        } catch (error) {
            console.error('PHP execution failed:', error);
            throw error;
        }
    }
};
