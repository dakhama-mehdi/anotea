module.exports = (db, regions) => {

    let { findActiveRegions } = regions;
    let avis = db.collection('comment');
    let organismes = db.collection('accounts');
    let trainee = db.collection('trainee');


    const getOrganismesStats = async (regionName, codeRegions) => {

        let filter = { codeRegion: { $in: codeRegions } };
        let [
            nbOrganismesContactes,
            nbRelances,
            ouvertureMails,
            nbClicDansLien,
            organismesActifs,
            avisNonLus,
            avisModeresNonRejetes,
            nbReponses,
            nbReponsesAvecCommentaires,
            avisSignales
        ] = await Promise.all([
            organismes.countDocuments({ 'mailSentDate': { $ne: null }, 'profile': 'organisme', ...filter }),
            organismes.countDocuments({ 'resend': true, 'profile': 'organisme', ...filter }),
            organismes.countDocuments({
                'mailSentDate': { $ne: null },
                'tracking.firstRead': { $ne: null },
                'profile': 'organisme', ...filter
            }),
            organismes.countDocuments({ 'tracking.click': { $ne: null }, 'profile': 'organisme', ...filter }),
            organismes.countDocuments({
                'mailSentDate': { $ne: null },
                'passwordHash': { $ne: null },
                'profile': 'organisme', ...filter
            }),
            avis.countDocuments({
                'published': true,
                '$or': [{ 'read': false }, { 'read': { $ne: true } }], ...filter
            }),
            avis.countDocuments({ 'moderated': true, 'rejected': false, ...filter }),
            avis.countDocuments({ 'reponse': { $exists: true }, ...filter }),
            avis.countDocuments({ 'reponse': { $exists: true }, 'comment': { $exists: true }, ...filter }),
            avis.countDocuments({ 'reported': true, ...filter }),
        ]);

        return {
            regionName,
            nbOrganismesContactes,
            mailsEnvoyes: nbRelances + nbOrganismesContactes,
            avisModeresNonRejetes,
            ouvertureMails,
            nbClicDansLien,
            organismesActifs,
            avisNonLus,
            nbReponses,
            nbReponsesAvecCommentaires,
            avisSignales,
        };
    };

    const getAvisStats = async (regionName, codeRegions) => {

        let filter = { codeRegion: { $in: codeRegions } };

        let [
            nbStagiairesImportes,
            nbStagiairesContactes,
            nbRelances,
            nbMailsOuverts,
            nbLiensCliques,
            nbQuestionnairesValidees,
            nbAvisAvecCommentaire,
            nbCommentairesAModerer,
            nbCommentairesPositifs,
            nbCommentairesNegatifs,
            nbCommentairesRejetes
        ] = await Promise.all([
            trainee.countDocuments({ ...filter }),
            trainee.countDocuments({ 'mailSent': true, ...filter }),
            db.collection('trainee').aggregate([
                { $match: { 'mailSent': true, ...filter } },
                {
                    $group: {
                        _id: null,
                        mailRetries: { $sum: '$mailRetry' },
                    }
                },
            ]).toArray(),
            trainee.countDocuments({ 'tracking.firstRead': { $ne: null }, ...filter }),
            trainee.countDocuments({ 'tracking.click': { $ne: null }, ...filter }),
            trainee.countDocuments({ 'avisCreated': true, ...filter }),
            avis.countDocuments({ 'comment': { $ne: null }, ...filter }),
            avis.countDocuments({ 'comment': { $ne: null }, 'moderated': { $ne: true }, ...filter }),
            avis.countDocuments({ 'comment': { $ne: null }, 'qualification': 'positif', ...filter }),
            avis.countDocuments({ 'comment': { $ne: null }, 'qualification': 'négatif', ...filter }),
            avis.countDocuments({ 'rejected': true, ...filter })
        ]);

        return {
            regionName,
            nbStagiairesImportes,
            nbStagiairesContactes,
            nbMailEnvoyes: nbRelances.length > 0 ? (nbRelances[0].mailRetries + nbStagiairesContactes) : 0,
            nbCommentairesAModerer,
            nbMailsOuverts,
            nbLiensCliques,
            nbQuestionnairesValidees,
            nbAvisAvecCommentaire,
            nbCommentairesPositifs,
            nbCommentairesNegatifs,
            nbCommentairesRejetes,
        };
    };

    return {
        computeOrganismesStats: () => {
            let regions = findActiveRegions();
            return Promise.all([
                getOrganismesStats('Toutes', regions.map(region => region.codeRegion)),
                ...regions.map(region => getOrganismesStats(region.nom, [region.codeRegion])),
            ]);

        },
        computeAvisStats: () => {
            let regions = findActiveRegions();
            return Promise.all([
                getAvisStats('Toutes', regions.map(region => region.codeRegion)),
                ...regions.map(region => getAvisStats(region.nom, [region.codeRegion])),
            ]);
        },
    };
};
