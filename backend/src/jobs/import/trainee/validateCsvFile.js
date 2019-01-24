const fs = require('fs');
const md5 = require('md5');
const parse = require('csv-parse');
const readline = require('readline');
const _ = require('underscore');
const validateTrainee = require('./validateTrainee');
const { getCampaignDate, getCampaignName } = require('./utils');

const ValidationErrorTypes = Object.freeze({
    BAD_HEADER: { name: 'BAD_HEADER', message: 'du format non conforme' },
    BAD_DATA: { name: 'BAD_DATA', message: 'du format non conforme' },
    DUPLICATED: { name: 'DUPLICATED', message: 'de la présence de doublons' },
});

const isEmptyLine = input => input === ';;;;;;;;;;;;;;;;';

const isHeaderValid = (rawLine, csvOptions) => {
    const headers = rawLine.split(csvOptions.delimiter);
    return _.isEqual(headers, csvOptions.columns);
};

const isLineDuplicated = (lines, rawLine) => {
    return lines.filter(line => _.isEqual(line, rawLine)).length > 0;
};

const isLineValid = (file, handler, rawLine) => {
    return new Promise((resolve, reject) => {

        let campaign = {
            name: getCampaignName(file),
            date: getCampaignDate(file),
        };

        parse(rawLine, handler.csvOptions, async (err, data) => {

            if (err) {
                return resolve(false);
            }

            try {
                let trainee = await handler.buildTrainee(data[0], campaign);
                if (await handler.shouldBeImported(trainee)) {
                    return validateTrainee(trainee)
                    .then(() => resolve(true))
                    .catch(() => resolve(false));
                } else {
                    return resolve(true);
                }
            } catch (e) {
                return reject(e);
            }
        });
    });
};

module.exports = async (file, handler) => {
    return new Promise((resolve, reject) => {
        let error = null;
        let promises = [];
        let lines = [];

        let rl = readline.createInterface({ input: fs.createReadStream(file) });
        rl.on('line', async line => {
            if (error || isEmptyLine(line)) {
                return;
            }

            if (lines.length === 0) {
                if (!isHeaderValid(line, handler.csvOptions)) {
                    error = {
                        type: ValidationErrorTypes.BAD_HEADER,
                        line: line
                    };
                }
            } else {
                try {
                    let validPromise = isLineValid(file, handler, line);
                    promises.push(validPromise);
                    if (!await validPromise) {
                        error = {
                            type: ValidationErrorTypes.BAD_DATA,
                            line: line
                        };
                    }

                    if (isLineDuplicated(lines, md5(line))) {
                        error = {
                            type: ValidationErrorTypes.DUPLICATED,
                            line: line
                        };
                    }
                } catch (e) {
                    reject(e);
                }
            }

            lines.push(md5(line));
            if (error) {
                rl.close();
            }
        }).on('close', async () => {
            await Promise.all(promises);
            return resolve(error);
        });
    });
};