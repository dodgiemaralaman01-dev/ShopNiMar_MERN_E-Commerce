const crypto = require("node:crypto");
const { promisify } = require("node:util");

const HASH_SCHEME = "pbkdf2-sha256";
const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const DIGEST = "sha256";
const pbkdf2 = promisify(crypto.pbkdf2);

function createPasswordHash(password) {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
    return `${HASH_SCHEME}$${ITERATIONS}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

function parsePasswordHash(passwordHash) {
    if (typeof passwordHash !== "string") {
        return null;
    }

    const [scheme, iterationText, saltHex, derivedKeyHex, ...extra] = passwordHash.split("$");
    const iterations = Number(iterationText);
    if (
        extra.length > 0 ||
        scheme !== HASH_SCHEME ||
        !Number.isSafeInteger(iterations) ||
        iterations < ITERATIONS ||
        iterations > 1000000 ||
        !/^[a-f0-9]{32}$/i.test(saltHex || "") ||
        !/^[a-f0-9]{64}$/i.test(derivedKeyHex || "")
    ) {
        return null;
    }

    return {
        iterations,
        salt: Buffer.from(saltHex, "hex"),
        derivedKey: Buffer.from(derivedKeyHex, "hex"),
    };
}

function isPasswordHash(passwordHash) {
    return parsePasswordHash(passwordHash) !== null;
}

async function verifyPassword(password, passwordHash) {
    const parsedHash = parsePasswordHash(passwordHash);
    if (typeof password !== "string" || !parsedHash) {
        return false;
    }

    const derivedKey = await pbkdf2(password, parsedHash.salt, parsedHash.iterations, KEY_LENGTH, DIGEST);
    return crypto.timingSafeEqual(derivedKey, parsedHash.derivedKey);
}

module.exports = {
    createPasswordHash,
    isPasswordHash,
    verifyPassword,
};
