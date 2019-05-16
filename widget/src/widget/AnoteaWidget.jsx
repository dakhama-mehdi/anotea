import React, { Component } from 'react';
import { getOrganismesFormateurs, getAvis, getActions, getFormations } from './services/avisService';
import AvisCarrousel from './components/AvisCarrousel';
import AvisList from './components/AvisList';
import Stars from './components/Stars';
import Verified from './components/Verified';
import Star from './icons/Star';

class AnoteaWidget extends Component {

    state = {
        type: null,
        siret: null,
        numeroAction: null,
        score: null,
        avis: [],
        average: 0
    };

    constructor(props) {
        super();
        this.state = {
            type: props.type,
            siret: props.siret,
            numeroAction: props.numeroAction,
            numeroFormation: props.numeroFormation
        };
        if (this.state.type === 'organisme') {
            this.loadOrganismeInfo(this.state.siret);
        } else if (this.state.type === 'action') {
            this.loadActionFormationInfo(this.state.numeroAction);
        } else if (this.state.type === 'formation') {
            this.loadFormationInfo(this.state.numeroFormation);
        }
    }

    getAverage = note => `${note}`.replace('.', ',');

    loadOrganismeInfo = async siret => {
        let [stats, avis] = await Promise.all([
            getOrganismesFormateurs(siret),
            getAvis(siret)
        ]);
        if (stats.organismes_formateurs.length > 0) {
            this.setState({
                score: stats.organismes_formateurs[0].score,
                avis: avis.avis,
                average: this.getAverage(stats.organismes_formateurs[0].score.notes.global)
            });
        }
    };

    loadActionFormationInfo = async numeroAction => {
        let result = await getActions(numeroAction);

        if (result.actions.length > 0) {
            this.setState({
                score: result.actions[0].score,
                avis: result.actions[0].avis,
                average: this.getAverage(result.actions[0].score.notes.global)
            });
        }
    };

    loadFormationInfo = async id => {
        let result = await getFormations(id);

        if (result.formations.length > 0) {
            this.setState({
                score: result.formations[0].score,
                avis: result.formations[0].avis,
                average: this.getAverage(result.formations[0].score.notes.global)
            });
        }
    };

    getStyle = () => {
        if (this.props.layout === 'liste') {
            if (this.props.width) {
                return { width: `${this.props.width}px`, whiteSpace: 'nowrap' };
            } else {
                return { whiteSpace: 'nowrap' };
            }
        } else if (this.props.layout !== 'liste') {
            if (this.props.width) {
                return { width: `${this.props.width}px` };
            } else {
                return { width: '300px' };
            }
        } else {
            return {};
        }
    };

    render() {
        return (
            <div>
                <div className={`anotea-widget ${this.props.layout === 'liste' ? 'liste' : ''}`}
                     style={this.getStyle()}>
                    {this.state.score &&
                    <div className="col1">
                        <h1 className="title">Avis d'anciens stagiaires</h1>

                        {this.props.layout !== "liste" &&
                        <Verified />
                        }


                        <div className="score">
                            <div className="average">
                                <span className="rate">{this.state.average}</span>
                                <span className="total">/5
                                <Star active={true} />
                            </span>
                                <span className="avis-count">{this.state.score.nb_avis} notes</span>
                            </div>

                            <ul className="notes">
                                <li>
                                    <span className="label">Accueil</span> <Stars
                                    value={this.state.score.notes.accueil} />
                                </li>
                                <li>
                                    <span className="label">Contenu</span> <Stars
                                    value={this.state.score.notes.contenu_formation} />
                                </li>
                                <li>
                                    <span className="label">Formateurs</span> <Stars
                                    value={this.state.score.notes.equipe_formateurs} />
                                </li>
                                <li>
                                    <span className="label">Matériels</span> <Stars
                                    value={this.state.score.notes.moyen_materiel} />
                                </li>
                                <li>
                                    <span className="label">Accompagnement</span> <Stars
                                    value={this.state.score.notes.accompagnement} />
                                </li>
                            </ul>
                        </div>

                        {this.props.layout !== "liste" &&
                        <AvisCarrousel
                            avis={this.state.avis && this.state.avis.filter(avis => avis.commentaire)} />
                        }

                        <div className="propulsed">
                            Propulsé par <img src={`/images/logo.png`} alt="logo Anotea" />
                        </div>
                    </div>
                    }
                    {this.state.score && this.props.layout === "liste" &&
                    <div className="col2">
                        <AvisList
                            width={this.props.width - 260}
                            avis={this.state.avis && this.state.avis.filter(avis => avis.commentaire)} />
                    </div>
                    }
                    <div className="spacer" style={{ clear: 'both' }} />
                </div>
            </div>
        );
    }
}

export default AnoteaWidget;
