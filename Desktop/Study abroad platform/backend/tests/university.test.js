const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

test('GET /api/universities supports country filtering', async () => {
  const server = app.listen(0);
  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/api/universities?country=Pakistan`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.every((u) => String(u.country).toLowerCase() === 'pakistan'));
  } finally {
    server.close();
  }
});

test('GET /api/universities/:id returns fallback university data for demo IDs', async () => {
  const server = app.listen(0);
  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/api/universities/demo-1`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.name, 'University of Oxford');
  } finally {
    server.close();
  }
});
