const _ = require('lodash');
const asSiren = siret => siret.substring(0, 9);

const getDepartement = codePostal => codePostal.substring(0, 2);

module.exports = async (db, intercarif, action) => {

    let adresse = action.lieu_de_formation.coordonnees.adresse;
    let siret = action.organisme_formateur.siret_formateur.siret;

    let comments = await db.collection('comment').find({
        'training.organisation.siret': new RegExp(`^${asSiren(siret)}`),
        '$or': [
            { 'comment': { $exists: false } },
            { 'published': true },
            { 'rejected': true },
        ],
        '$and': [
            {
                '$or': [
                    { 'training.certifInfo.id': { $in: intercarif._meta.certifinfos } },
                    { 'formacode': { $in: intercarif._meta.formacodes } },
                ]

            },
            {
                '$or': [
                    {
                        'training.place.postalCode': adresse.codepostal,
                    },
                    {
                        $and: [
                            {
                                'training.place.postalCode': {
                                    $not: /^(75|690|130)/
                                }
                            },
                            {
                                'training.place.postalCode': {
                                    $regex: new RegExp(`^${getDepartement(adresse.codepostal)}`)
                                },
                                'training.place.city': adresse.ville,
                            },
                        ]
                    }
                ]

            }
        ],
    })
    .project({
        _id: 1,
        training: 1,
        rates: 1,
        date: 1,
        formacode: 1,
        codeFinanceur: 1,
        comment: 1,
        pseudo: 1,
        pseudoMasked: 1,
        rejected: 1,
        editedComment: 1,
        reponse: 1,
        codeRegion: 1,
    })
    .toArray();

    let certifiants = comments.filter(comment => !_.isEmpty(comment.training.certifInfo.id));

    return { action, comments: certifiants.length > 0 ? certifiants : comments };
};
