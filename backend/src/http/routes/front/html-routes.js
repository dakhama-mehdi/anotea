const express = require('express');
const moment = require('moment');
const titleize = require('underscore.string/titleize');
const externalLinks = require('./utils/externalLinks');

module.exports = ({ db, logger, configuration, deprecatedStats, mailer, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    const getTraineeFromToken = (req, res, next) => {
        db.collection('trainee').findOne({ token: req.params.token })
        .then(trainee => {
            if (!trainee) {
                res.status(404).send({ error: 'not found' });
                return;
            }

            req.trainee = trainee;
            next();
        });
    };

    router.get('/', (req, res) => {
        res.render('front/homepage', { data: configuration.front });
    });

    router.get('/cgu', (req, res) => {
        res.render('front/cgu');
    });

    router.get('/faq', (req, res) => {
        res.render('front/faq');
    });

    router.get('/doc/:name', (req, res) => {
        let template = req.params.name;

        if (template === 'widget') {
            if (configuration.env === 'dev' && !req.query['load_anotea_widget_iframe_from_localhost']) {
                return res.redirect('/doc/widget?load_anotea_widget_iframe_from_localhost=true');
            }
            return res.render(`front/doc/widget${req.query.test ? '-tests' : ''}`);
        }

        return res.render(`front/doc/${template}`);

    });

    router.get('/link/:token', getTraineeFromToken, async (req, res) => {
        let trainee = req.trainee;
        const goto = req.query.goto;

        const links = ['lbb', 'pe', 'clara'];

        if (!links.includes(goto)) {
            res.status(404).render('errors/404');
            return;
        }

        const advice = await db.collection('comment').findOne({ token: req.params.token });
        if (!(advice.tracking && advice.tracking.clickLink && advice.tracking.clickLink.filter(item => item.goto === goto).length > 0)) {
            db.collection('comment').updateOne({ token: req.params.token }, {
                $push: {
                    'tracking.clickLink': {
                        date: new Date(),
                        goto: goto
                    }
                }
            });
        }

        res.redirect(await externalLinks(db).getLink(trainee, goto));
    });

    router.get('/mail/:token', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        const unsubscribeLink = mailer.getUnsubscribeLink(trainee);
        const formLink = mailer.getFormLink(trainee);
        trainee.trainee.firstName = titleize(trainee.trainee.firstName);
        trainee.trainee.name = titleize(trainee.trainee.name);

        res.render('front/mailing/votre_avis.ejs', {
            trainee: trainee,
            unsubscribeLink: unsubscribeLink,
            formLink: formLink,
            moment: moment,
            region: regions.findRegionByCodeRegion(trainee.codeRegion),
        });
    });

    router.get('/mail/:token/track', async (req, res) => {

        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        const trackRouteHandler = (collection, doc, found, response) => {
            if (found) {
                let trackingFieldName = doc.tracking && doc.tracking.firstRead ? 'lastRead' : 'firstRead';
                db.collection(collection).updateOne({ _id: doc._id }, {
                    $set: {
                        [`tracking.${trackingFieldName}`]: new Date()
                    }
                });
            }
            // serving a white 1x1 GIF
            let buf = new Buffer(35);
            buf.write('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');
            response.send(buf, { 'Content-Type': 'image/gif' }, 200);
        };

        if (trainee !== null) {
            trackRouteHandler('trainee', trainee, true, res);
        } else {
            const organisme = await db.collection('accounts').findOne({ token: req.params.token });
            if (organisme !== null) {
                trackRouteHandler('organismes', organisme, true, res);
            } else {
                trackRouteHandler(null, null, false, res);
            }
        }
    });

    router.get('/mail/:token/unsubscribe', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });

        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        db.collection('trainee').update({
            '_id': trainee._id
        }, {
            $set: {
                'unsubscribe': true
            }
        }, err => {
            if (err) {
                logger.error(err);
                res.status(500).render('errors/error');
            } else {
                res.render('front/mailing/unsubscribe.ejs', { trainee: trainee });
            }
        });
    });

    return router;
};