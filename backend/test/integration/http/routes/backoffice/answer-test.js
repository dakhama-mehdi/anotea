const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newComment } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur, getTestDatabase }) => {

    it('can answer to a comment', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        let comment = newComment();
        await insertIntoDatabase('comment', comment);

        let response = await request(app)
        .post(`/api/backoffice/advice/${comment._id}/answer`)
        .set('authorization', `Bearer ${token}`)
        .send({ answer: 'Voici notre réponse' });

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            message: 'advice answered',
        });

        let db = await getTestDatabase();
        let result = await db.collection('comment').findOne({ _id: comment._id });
        assert.ok(result);
        assert.deepEqual(result.answer, {
            text: 'Voici notre réponse',
            published: true,
            rejected: false,
            moderated: false,
            reported: false
        });
    });

    it('can delete an answer', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        let comment = newComment({
            answer: {
                text: 'Voici notre réponse',
                published: false,
                rejected: false,
                moderated: false,
                reported: false
            }
        });
        await insertIntoDatabase('comment', comment);

        let response = await request(app)
        .delete(`/api/backoffice/advice/${comment._id}/answer`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            message: 'advice answer removed',
        });

        let db = await getTestDatabase();
        let result = await db.collection('comment').findOne({ _id: comment._id });
        assert.ok(result);
        assert.deepEqual(result.answer, undefined);
    });

    it('should reject invalid comment id', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');

        let response = await request(app)
        .post(`/api/backoffice/advice/12345/answer`)
        .set('authorization', `Bearer ${token}`)
        .send({ answer: 'Voici notre réponse' });

        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Identifiant invalide'
        });
    });

}));
