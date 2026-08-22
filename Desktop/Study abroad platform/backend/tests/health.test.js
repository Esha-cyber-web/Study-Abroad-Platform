const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

test('health endpoint returns backend status', async () => {
  const server = app.listen(0);
  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(typeof body.message, 'string');
  } finally {
    server.close();
  }
});
