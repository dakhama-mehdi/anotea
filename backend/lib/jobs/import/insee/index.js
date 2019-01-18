#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Import Postal Code <-> City Code INSEE mapping from CSV file')
.option('-f, --file [file]', 'The CSV file to import')
.parse(process.argv);


execute(async ({ logger, db, exit, configuration }) => {

    let romeImporter = require(`./importer`)(db, logger, configuration);

    if (!cli.file) {
        return exit('invalid arguments');
    }

    return romeImporter.doImport(cli.file);
});