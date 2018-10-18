import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { getOrganisationTrainings } from '../../../lib/organisationService';
import { getOrganisationLieuTrainingSessions } from '../../../lib/financerService';

export default class SearchForm extends React.Component {

    state = {
        currentTraining: '',
        trainingList: [],
        sessionList: []
    };

    constructor(props) {
        super(props);
        this.changeTrainingSession = props.changeTrainingSession;
        this.unsetTraining = props.unsetTraining;
    }

    componentWillReceiveProps = nextProps => {
        if (nextProps.id !== null && nextProps.currentEntity != null) {
            if (nextProps.id !== this.state.organisationId || nextProps.currentEntity.id !== this.state.postalCode) {
                getOrganisationTrainings(nextProps.id, nextProps.currentEntity.id).then(trainings => {
                    this.setState({
                        organisationId: nextProps.id,
                        postalCode: nextProps.currentEntity.id,
                        currentTraining: null,
                        trainingList: trainings,
                        sessionList: [],
                    });
                });
            }
        }
    };

    changeTraining = options => {
        const training = this.state.trainingList.filter(training => {
            if (training._id === options.id) {
                return training;
            }
        })[0];
        this.setState({ currentTraining: training }, () => {
            this.changeTrainingSession(training._id, this.props.currentEntity._id);
            getOrganisationLieuTrainingSessions(this.state.organisationId, training._id, this.props.currentEntity._id).then(sessions => {
                if (sessions.length > 0) {
                    this.setState({
                        sessionList: sessions,
                        currentSession: sessions[0].postalCode
                    });
                }
            });
        });
    };

    unsetCurrentTraining = () => {
        this.setState(Object.assign(this.state, {
            currentTraining: '',
        }), () => {
            this.unsetTraining();
        });
    };

    render() {
        const { currentTraining } = this.state;

        return (
            this.state.trainingList.length > 0 &&
            <div className="SearchForm">
                <h2 className="subtitle">
                    {currentTraining &&
                    <div>
                        <strong>Formation : {' '}
                            {currentTraining.title}
                            <small>({currentTraining.count} avis)</small>
                        </strong>
                        <button type="button" className="close" aria-label="Close" onClick={this.unsetCurrentTraining}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    }
                    <div className="dropdown">
                        <Select
                            onChange={this.changeTraining}
                            options={this.state.trainingList.map(training => ({
                                label: training.title + ` (` + training.count + `avis)`,
                                id: training._id
                            }))}
                            placeholder="Chercher et sélectionner une formation"
                        />
                    </div>
                </h2>
            </div>
        );
    }

}
