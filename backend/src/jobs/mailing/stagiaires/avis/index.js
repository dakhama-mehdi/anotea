#!/usr/bin/env node
'use strict';

const cli = require('commander');
const TraineeMailer = require('./AvisMailer');
const { capitalizeFirstLetter, execute } = require('../../../job-utils');

cli.description('send email campaign')
.option('--campaign [campaign]', 'Limit emailing to the campaign name')
.option('--region [region]', 'Limit emailing to the region')
.option('--type [type]', 'resend,retry,send (default: send))', capitalizeFirstLetter)
.option('--limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

execute(async ({ logger, db, configuration, mailer, regions, sendSlackNotification }) => {

    let type = cli.type || 'Send';
    let traineeMailer = new TraineeMailer(db, logger, mailer);
    let ActionClass = require(`./actions/${type}Action`);
    let action = new ActionClass(configuration, {
        campaign: cli.campaign,
        codeRegions: cli.region ? [cli.region] :
            regions.findActiveRegions('mailing.stagiaires.avis').map(region => region.codeRegion),
    });

    logger.info(`Sending emails to stagiaires (${type})...`);

    try {
        let stats = await traineeMailer.sendEmails(action, {
            limit: cli.limit,
            delay: cli.delay,
        });

        sendSlackNotification({
            text: `${stats.sent} emails stagiaires envoyés pour ${cli.campaign || type} ` +
                `(Nombre d'erreurs : ${stats.error})`,
        });

        return stats;

    } catch (stats) {
        sendSlackNotification({
            text: `${stats.error} emails stagiaires n'ont pas pu être envoyés pour ${cli.campaign || type} ` +
                `(Nombre d'emails envoyés : ${stats.sent})`,
        });
        throw stats;
    }
}, { slack: cli.slack });
