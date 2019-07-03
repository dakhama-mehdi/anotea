import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import calculateRate from './utils/calculateRate';
import './StatsTable.scss';

export default class AvisStatsTable extends Component {

    static propTypes = {
        stats: PropTypes.array.isRequired,
        campaignStats: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            showRates: false,
        };
    }

    computeRate(dividend, divisor) {
        return this.state.showRates ? calculateRate(dividend, divisor) : dividend;
    }

    render() {

        let { stats, campaignStats } = this.props;
        let mailSent = campaignStats[0].map(e => e.mailSent).reduce((a, b) => a + b);
        let mailOpen = campaignStats[0].map(e => e.mailOpen).reduce((a, b) => a + b);
        let linkClick = campaignStats[0].map(e => e.linkClick).reduce((a, b) => a + b);
        let formValidated = campaignStats[0].map(e => e.formValidated).reduce((a, b) => a + b);
        let allowToContact = campaignStats[0].map(e => e.allowToContact).reduce((a, b) => a + b);
        let nbCommentaires = campaignStats[0].map(e => e.nbCommentaires).reduce((a, b) => a + b);

        return (
            <div>
                <table className="StatsTable table table-hover">
                    <thead>
                        <tr className="column-name">
                            <th colSpan="1">Régions</th>
                            <th colSpan="2">Stagiaires</th>
                            <th colSpan="4">Emails</th>
                            <th colSpan="2">Avis</th>
                            <th colSpan="4">Commentaires</th>
                        </tr>
                        <tr className="column-subname">
                            <th scope="col">
                                <div>
                                    <input
                                        name="showRates"
                                        type="checkbox"
                                        checked={this.state.showRates}
                                        onChange={() => this.setState({ showRates: !this.state.showRates })} />
                                    <span> Taux</span>
                                </div>
                            </th>
                            <th scope="col" className="section">Importés <i className="fas fa-question-circle"><span className="tooltip">Nombre de stagiaires présents dans le fichier datalake</span></i></th>
                            <th scope="col">Contactés <i className="fas fa-question-circle"><span className="tooltip">Nombre de stagiaires à qui un mail à été envoyé</span></i></th>
                            <th scope="col" className="section">Envoyés <i className="fas fa-question-circle"><span className="tooltip">Nombre de mails envoyés aux stagiaires</span></i></th>
                            <th scope="col">Ouverts <i className="fas fa-question-circle"><span className="tooltip">Taux d&apos;ouverture de mails</span></i></th>
                            <th scope="col">Cliqués <i className="fas fa-question-circle"><span className="tooltip">Taux de clic dans le questionnaire</span></i> </th>
                            <th scope="col">Validés <i className="fas fa-question-circle"><span className="tooltip">Taux de questionnaires validés</span></i></th>
                            <th scope="col" className="section">Déposés <i className="fas fa-question-circle"><span className="tooltip">Taux d&apos;avis déposés</span></i></th>
                            <th scope="col">Avec commentaires <i className="fas fa-question-circle"><span className="tooltip">Taux d&apos;avis avec commentaire</span></i></th>
                            <th scope="col" className="section">À modérer <i className="fas fa-question-circle"><span className="tooltip">Nombre de commentaires à modérer</span></i></th>
                            <th scope="col">Positif/Neutre <i className="fas fa-question-circle"><span className="tooltip">Taux de commentaires positifs ou neutres</span></i></th>
                            <th scope="col">Negatifs <i className="fas fa-question-circle"><span className="tooltip">Taux de commentaires négatifs</span></i></th>
                            <th scope="col">Rejetés <i className="fas fa-question-circle"><span className="tooltip">Taux de commentaires rejetés</span></i></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            stats.map((a, index) => (
                                <tr key={index}>
                                    <th scope="row">
                                        {a.label}
                                    </th>
                                    <td className="section">
                                        {a.nbStagiairesImportes}
                                    </td>
                                    <td>
                                        {a.nbStagiairesContactes}
                                    </td>
                                    <td className="section">
                                        {a.nbMailEnvoyes}
                                    </td>
                                    <td>
                                        {this.computeRate(a.nbMailsOuverts, a.nbStagiairesContactes)}
                                    </td>
                                    <td>
                                        {this.computeRate(a.nbLiensCliques, a.nbMailsOuverts)}
                                    </td>
                                    <td>
                                        {this.computeRate(a.nbQuestionnairesValidees, a.nbLiensCliques)}
                                    </td>
                                    <td className="section">
                                        {this.computeRate(a.nbQuestionnairesValidees, a.nbStagiairesContactes)}
                                    </td>
                                    <td>
                                        {this.computeRate(a.nbAvisAvecCommentaire, a.nbQuestionnairesValidees)}
                                    </td>
                                    <td className="section">
                                        {a.nbCommentairesAModerer}
                                    </td>
                                    <td>
                                        {this.computeRate(a.nbCommentairesPositifs, a.nbAvisAvecCommentaire)}
                                    </td>
                                    <td>
                                        {this.computeRate(a.nbCommentairesNegatifs, a.nbAvisAvecCommentaire)}
                                    </td>
                                    <td>
                                        {this.computeRate(a.nbCommentairesRejetes, a.nbAvisAvecCommentaire)}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                
                <div className="separator div-transparent"></div>

                <table className="StatsTable table table-hover">
                    <thead>
                        <tr className="column-subname">
                            <th scope="col">
                                <div>
                                    <input
                                        name="showRates"
                                        type="checkbox"
                                        checked={this.state.showRates}
                                        onChange={() => this.setState({ showRates: !this.state.showRates })} />
                                    <span> Taux</span>
                                </div>
                            </th>
                            <th scope="col">Date</th>
                            <th scope="col">Mails envoyés</th>
                            <th scope="col">Mails ouverts</th>
                            <th scope="col">Taux d&apos;ouverture</th>
                            <th scope="col">Ouverture de lien</th>
                            <th scope="col">Taux de clic</th>
                            <th scope="col">Personnes ayant validé le questionnaire</th>
                            <th scope="col">Taux de répondant</th>
                            <th scope="col">Autorisation de contact</th>
                            <th scope="col">Commentaires</th>
                            <th scope="col">Taux avis avec commentaire</th>
                            <th scope="col">Commentaires rejetés</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">
                                Toutes
                            </th>
                            <td>
                                -
                            </td>
                            <td>
                                { mailSent }
                            </td>
                            <td>
                                { mailOpen }
                            </td>
                            <td>
                                { this.computeRate(mailOpen, mailSent) }
                            </td>
                            <td>
                                { linkClick }
                            </td>
                            <td>
                                { this.computeRate(linkClick, mailOpen) }
                            </td>
                            <td >
                                { formValidated }
                            </td>
                            <td>
                                { this.computeRate(formValidated, mailSent) }
                            </td>
                            <td>
                                { allowToContact }
                            </td>
                            <td>
                                { nbCommentaires }
                            </td>
                            <td>
                                { this.computeRate(nbCommentaires, formValidated) }
                            </td>
                            <td>
                                { campaignStats[0].map(e => e.nbCommentairesRejected).reduce((a, b) => a + b) }
                            </td>
                        </tr>
                        {
                            campaignStats[0].map((a, index) => (
                                <tr key={index}>
                                    <th scope="row">
                                        {a._id}
                                    </th>
                                    <td>
                                        {a.date && moment(a.date).format('DD/MM/YYYY')}
                                    </td>
                                    <td>
                                        {a.mailSent}
                                    </td>
                                    <td>
                                        {a.mailOpen}
                                    </td>
                                    <td>
                                        1
                                    </td>
                                    <td>
                                        {a.linkClick}
                                    </td>
                                    <td>
                                        2
                                    </td>
                                    <td >
                                        {a.formValidated}
                                    </td>
                                    <td>
                                        1
                                    </td>
                                    <td>
                                        {a.allowToContact}
                                    </td>
                                    <td>
                                        {a.nbCommentaires}
                                    </td>
                                    <td>
                                        1
                                    </td>
                                    <td>
                                        {a.nbCommentairesRejected}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

