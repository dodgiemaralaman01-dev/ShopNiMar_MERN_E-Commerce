const test = require("node:test");
const assert = require("node:assert/strict");
const { createPasswordHash, isPasswordHash, verifyPassword } = require("./adminPassword");

test("admin password hashes verify without storing the password", async () => {
    const password = "test-only-admin-password";
    const passwordHash = createPasswordHash(password);

    assert.equal(isPasswordHash(passwordHash), true);
    assert.equal(await verifyPassword(password, passwordHash), true);
    assert.equal(await verifyPassword("incorrect-password", passwordHash), false);
});

test("malformed admin password hashes are rejected", async () => {
    assert.equal(isPasswordHash("not-a-password-hash"), false);
    assert.equal(await verifyPassword("any-password", "not-a-password-hash"), false);
});
