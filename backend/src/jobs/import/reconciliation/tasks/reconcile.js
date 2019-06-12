const reconcileFormation = require('./utils/reconcileFormation');
const reconcileActions = require('./utils/reconcileActions');
const reconcileSessions = require('./utils/reconcileSessions');
const findAvisReconciliables = require('./utils/findAvisReconciliables');

module.exports = async (db, logger, options = { formations: true, actions: true, sessions: true }) => {

    let stats = {
        imported: { formations: 0, actions: 0, sessions: 0 },
        error: 0,
    };

    let replaceOne = (type, doc) => {
        return db.collection(`${type}Reconciliees`).replaceOne({ _id: doc._id }, doc, { upsert: true })
        .then(results => {
            stats.imported[type]++;
            return results;
        })
        .catch(e => {
            logger.error(`Unable to reconcile ${type} with id ${doc._id} `, e);
            return stats.error++;
        });
    };

    let cursor = db.collection('intercarif')
    .find()
    .batchSize(25)
    .project({
        '_attributes': 1,
        '_meta': 1,
        'intitule_formation': 1,
        'objectif_formation': 1,
        'organisme_formation_responsable': 1,
        'actions._attributes': 1,
        'actions.organisme_formateur': 1,
        'actions.organisme_financeurs': 1,
        'actions.lieu_de_formation': 1,
        'actions.sessions._attributes': 1,
        'actions.sessions.periode': 1,
    });

    let promises = [];
    while (await cursor.hasNext()) {
        let rawFormation = await cursor.next();

        if (promises.length >= 25) {
            await Promise.all(promises);
            promises = [];
        }

        try {
            let avis = await findAvisReconciliables(db, rawFormation);

            let formation = reconcileFormation(rawFormation, avis);
            let actions = reconcileActions(rawFormation, avis);
            let sessions = reconcileSessions(rawFormation, avis);

            promises.push(
                Promise.all([
                    ...(options.formations ? [replaceOne('formations', formation)] : []),
                    ...(options.actions ? [Promise.all(actions.map(action => replaceOne('actions', action)))] : []),
                    ...(options.sessions ? [Promise.all(sessions.map(session => replaceOne('sessions', session)))] : []),
                ])
            );

            logger.debug(`Formation ${rawFormation._attributes.numero} from intercarif has been reconciliated`);

        } catch (e) {
            stats.error++;
            logger.error(`Formation ${rawFormation._attributes.numero} can not be reconciliated`, e);
        }
    }

    await Promise.all(promises);

    return stats.error ? Promise.reject(stats) : stats;
};

