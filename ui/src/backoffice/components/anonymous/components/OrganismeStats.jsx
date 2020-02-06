import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { latest } from '../../../services/statsService';
import HistoryLines, { convertToRatioLine } from './HistoryLines';
import { formatNumber, percentage } from '../../../utils/number-utils';

export default class OrganismeStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.array.isRequired,
    };

    render() {
        let { query, stats } = this.props;
        let type = query.codeRegion ? 'regional' : 'national';
        let groupBy = 'month';

        return (
            <div className="Stats">
                <div className="main d-flex justify-content-center justify-content-lg-between">
                    <div className="d-flex flex-column">
                        <div className="title">
                            <div>
                                <i className="fas fa-graduation-cap a-icon"></i>
                                Organismes
                            </div>
                        </div>
                        <div className="d-flex justify-content-around flex-wrap">
                            <div className="stats">
                                <div className="name">Nombre</div>
                                <div
                                    className="value">{formatNumber(latest(stats, type, 'organismes.nbOrganismesActifs'))}</div>
                            </div>
                            <div className="stats">
                                <div className="name">Avis répondus</div>
                                <div className="value">{formatNumber(latest(stats, type, 'avis.nbReponses'))}</div>
                            </div>
                            <div className="stats">
                                <div className="name">Taux réponse</div>
                                <div>
                                <span className="value highlighted">
                                    {percentage(latest(stats, type, 'avis.nbReponses'), latest(stats, type, 'avis.nbAvis'))}%
                                </span>
                                    {type === 'regional' &&
                                    <span className="value compare">
                                    {percentage(latest(stats, 'national', 'avis.nbReponses'), latest(stats, 'national', 'avis.nbAvis'))}%*
                                    </span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow-1" style={{ height: '300px', minWidth: '250px' }}>
                        <HistoryLines
                            colors={type === 'regional' ? ['rgba(35, 47, 56, 0.4)', '#F28017'] : ['rgba(35, 47, 56, 0.4)']}
                            groupBy={groupBy}
                            format={v => `${v}%`}
                            lines={[
                                convertToRatioLine(stats, type, 'avis.nbReponses', 'avis.nbAvis', {
                                    groupBy,
                                    tooltip: data => `Réponses : ${data}`,
                                }),
                                ...(type === 'regional' ? [
                                    convertToRatioLine(stats, 'national', 'avis.nbReponses', 'avis.nbAvis', {
                                        groupBy,
                                        tooltip: data => `Réponses : ${data}`,
                                    }),
                                ] : []),
                            ]}
                        />
                    </div>
                </div>

            </div>
        );
    }
}
