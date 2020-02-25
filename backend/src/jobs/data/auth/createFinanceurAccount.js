#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Create new account')
.option('--identifiant [identifiant]')
.option('--region [region]')
.option('--codeFinanceur [codeFinanceur]')
.option('--password [password]')
.parse(process.argv);

execute(async ({ db, exit, passwords }) => {

    let { identifiant, password, region, codeFinanceur } = cli;

    if (!identifiant || !password || !region || !codeFinanceur) {
        return exit('Invalid arguments');
    }

    return db.collection('accounts').insertOne({
        identifiant,
        codeRegion: region,
        profile: 'financeur',
        codeFinanceur,
        passwordHash: await passwords.hashPassword(cli.password),
        meta: {
            rehashed: true
        },
    });
});