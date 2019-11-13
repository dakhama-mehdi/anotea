const fs = require('fs');
const _ = require('lodash');
const { ignoreFirstLine, pipeline, writeObject } = require('../../../../common/utils/stream-utils');
const parse = require('csv-parse');

let loadCertifinfos = async file => {
    let handleChaining = mapping => {

        let codesReducer = codes => {
            return codes.reduce((acc, code) => {
                let newCodes = mapping[code];
                if (newCodes) {
                    return [...acc, ...codesReducer(newCodes)];
                }
                return [...acc, code];
            }, []);
        };

        return Object.keys(mapping).reduce((acc, code) => {
            let newCodes = mapping[code];

            let hasChain = newCodes.filter(c => mapping[c]).length > 0;
            return {
                ...acc,
                [code]: hasChain ? codesReducer(newCodes) : mapping[code],
            };
        }, {});
    };

    let mapping = {};
    await pipeline([
        fs.createReadStream(file),
        parse({
            delimiter: ';',
            quote: '',
            relax_column_count: true,
            columns: [
                'cer3_code',
                'cer3_libelle',
                'cer3_etat',
                'cer3_codenew',
                'cer3_libellenew',
                'cer3_etat',
            ],
        }),
        ignoreFirstLine(),
        writeObject(data => {
            let codenew = data.cer3_codenew;
            if (mapping[data.cer3_code]) {
                mapping[data.cer3_code].push(codenew);
            } else {
                mapping[data.cer3_code] = [codenew];
            }
        }),
    ]);

    return handleChaining(mapping);
};

module.exports = async (db, logger, file) => {

    const patch = async (collectionName, certifications) => {

        let stats = {
            updated: 0,
            invalid: 0,
            total: 0,
        };

        let getNewCertifInfos = doc => {
            return doc.training.certifInfos.reduce((acc, code) => {
                let codes = certifications[code] ? certifications[code] : [code];
                return [...acc, ...codes];
            }, []);
        };

        let getNewMeta = doc => {
            let meta = _.cloneDeep(doc.meta) || {};
            meta.history = meta.history || [];
            meta.history.unshift({
                date: new Date(),
                training: {
                    certifInfos: doc.training.certifInfos,
                },
            });

            return meta;
        };

        let cursor = db.collection(collectionName).find({});
        while (await cursor.hasNext()) {
            stats.total++;
            const doc = await cursor.next();
            try {
                if (doc.training.certifInfos.find(code => certifications[code])) {

                    let results = await db.collection(collectionName).replaceOne(
                        { _id: doc._id },
                        Object.assign({}, doc, {
                            training: {
                                certifInfos: getNewCertifInfos(doc),
                            },
                            meta: getNewMeta(doc),
                        }),
                        { upsert: false });

                    if (results.result.nModified === 1) {
                        stats.updated++;
                    }
                }
            } catch (e) {
                stats.invalid++;
                logger.error(`Stagiaire cannot be patched`, e);
            }
        }

        return stats;
    };

    let certifInfos = await loadCertifinfos(file);
    let [trainee, comment] = await Promise.all([
        patch('trainee', certifInfos),
        patch('comment', certifInfos),
    ]);

    return { trainee, comment };
};

