const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

test('universities endpoint returns fallback data in demo mode', async () => {
  const server = app.listen(0);
  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/api/universities`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body.data), 'expected data array');
    assert.ok(body.data.length > 0, 'expected fallback universities');
  } finally {
    server.close();
  }
});
