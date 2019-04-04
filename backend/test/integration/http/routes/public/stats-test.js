const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');

describe('/api/stats', withServer(({ startServer }) => {

    it('can get stats about mailing campaign', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/stats/mailing.json');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, []);
    });

    it('can get stats about sessions', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/stats/sessions.json');

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body);
    });

    it('can get stats about organismes', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/stats/organismes.json');

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body);
    });

}));
