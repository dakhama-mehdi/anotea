import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import HistoryLines from './HistoryLines';
import './Stats.scss';
import PrettyDate from '../../common/PrettyDate';
import { diff, divide, percentage } from '../../../services/statsService';

export default class GlobalStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.array.isRequired,
    };

    getGroupByUnit = (debut, fin) => {

        let start = moment(parseInt(debut) || moment('2019-08-01'));
        let end = moment(parseInt(fin) || moment());
        let diff = end.diff(start, 'days');

        if (diff >= 90) {
            return 'month';
        } else if (diff >= 15) {
            return 'week';
        }
        return 'day';
    };

    convertToLine = (stats, type, groupBy = 'week') => {
        return {
            id: `Taux de répondants (${type})`,
            data: stats
            .map((data, index) => {
                let date = data.date;
                let hasPrevious = !!(stats[index + 1] && stats[index + 1][type]);
                let hasCurrent = !!(data[type]);
                let previous = hasPrevious ? stats[index + 1][type].avis : { nbStagiairesContactes: 0, nbAvis: 0 };
                let current = hasCurrent ? data[type].avis : { nbStagiairesContactes: 0, nbAvis: 0 };

                return {
                    date,
                    nbAvis: current.nbAvis - previous.nbAvis,
                    nbStagiairesContactes: (current.nbStagiairesContactes - previous.nbStagiairesContactes),
                };
            })
            .reduce((acc, data) => {
                let selector = moment(data.date).startOf(groupBy).format('YYYY-MM-DDTHH:mm:ss.SSS');
                let group = acc.find(v => v.date === selector);
                if (!group) {
                    group = {
                        date: selector,
                        nbStagiairesContactes: 0,
                        nbAvis: 0,
                    };
                    acc.push(group);
                }

                group.nbStagiairesContactes += data.nbStagiairesContactes;
                group.nbAvis += data.nbAvis;

                return acc;

            }, [])
            .map(data => {
                return {
                    x: data.date,
                    y: divide(data.nbAvis * 100, data.nbStagiairesContactes)
                };
            }),
        };
    };

    render() {
        let { query, stats } = this.props;
        let type = query.codeRegion ? 'regional' : 'national';

        let groupBy = this.getGroupByUnit(query.debut, query.fin);
        return (
            <div className="Stats">
                <div className="main d-flex justify-content-center justify-content-lg-between">
                    <div className="d-flex flex-column">
                        <div className="title mb-5">
                            <PrettyDate
                                date={query.debut ? new Date(parseInt(query.debut)) : new Date()}
                                format={'DD/MM/YYYY'}
                                transform={d => d.charAt(0).toUpperCase() + d.slice(1)}
                            />
                            {query.fin &&
                            <>
                                <span className="px-1">-</span>
                                <PrettyDate
                                    date={query.fin ? new Date(parseInt(query.fin)) : new Date()}
                                    format={'DD/MM/YYYY'}
                                    transform={d => d.charAt(0).toUpperCase() + d.slice(1)}
                                />
                            </>
                            }
                        </div>
                        <div className="d-flex justify-content-around flex-wrap">
                            <div className="stats">
                                <div className="name">Total avis déposés</div>
                                <div className="value">{diff(stats, type, 'avis.nbAvis')}</div>
                            </div>
                            <div className="stats">
                                <div className="name">Taux répondants</div>
                                <div>
                                    <span className="value highlighted">
                                        {percentage(diff(stats, type, 'avis.nbAvis'), diff(stats, type, 'avis.nbStagiairesContactes'))}
                                    </span>
                                    {type === 'regional' &&
                                    <span className="value compare">
                                        {percentage(diff(stats, 'national', 'avis.nbAvis'), diff(stats, 'national', 'avis.nbStagiairesContactes'))}*
                                    </span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow-1" style={{ height: '300px', minWidth: '250px' }}>
                        <HistoryLines
                            lines={[
                                this.convertToLine(stats, 'national', groupBy),
                                ...(type === 'regional' ? [this.convertToLine(stats, 'regional', groupBy)] : []),
                            ]}
                            colors={type === 'regional' ? ['rgba(35, 47, 56, 0.4)', '#F28017'] : ['rgba(35, 47, 56, 0.4)']}
                            groupBy={groupBy}
                            format={v => `${v}%`}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
