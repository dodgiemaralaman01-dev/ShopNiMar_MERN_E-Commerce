const { createPasswordHash } = require("../adminPassword");

function readHiddenPassword() {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
        throw new Error("Run this command in an interactive terminal so the password can be hidden.");
    }

    process.stdout.write("Enter a new admin password (input hidden): ");
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdin.resume();

    return new Promise((resolve, reject) => {
        let password = "";

        const cleanup = () => {
            process.stdin.removeListener("data", handleInput);
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdout.write("\n");
        };

        const handleInput = (input) => {
            for (const character of input) {
                if (character === "\u0003") {
                    cleanup();
                    password = "";
                    reject(new Error("Password generation cancelled."));
                    return;
                }

                if (character === "\r" || character === "\n") {
                    cleanup();
                    resolve(password);
                    return;
                }

                if (character === "\u007f" || character === "\b") {
                    password = password.slice(0, -1);
                } else {
                    password += character;
                }
            }
        };

        process.stdin.on("data", handleInput);
    });
}

async function main() {
    const password = await readHiddenPassword();
    if (password.length < 12) {
        throw new Error("Choose an admin password with at least 12 characters.");
    }

    console.log(`ADMIN_PASSWORD_HASH=${createPasswordHash(password)}`);
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
