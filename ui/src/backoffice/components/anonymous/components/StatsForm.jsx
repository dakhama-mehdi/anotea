import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../common/components/Button';
import _ from 'lodash';
import { Form, Select } from '../../common/page/form/Form';
import { getRegions } from '../../../services/regionsService';
import BackofficeContext from '../../../BackofficeContext';

export default class StatsForm extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        query: PropTypes.object.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            regions: {
                selected: null,
                loading: true,
                results: [],
            },
        };
    }

    async componentDidMount() {

        let { query } = this.props;

        this.loadSelectBox('regions', () => getRegions())
        .then(results => {
            return this.updateSelectBox('regions', results.find(r => r.codeRegion === query.codeRegion));
        });
    }

    getParametersFromQuery = () => {
        let { query } = this.props;

        return {
            ...(query.codeRegion ? { codeRegion: query.codeRegion } : {}),
        };
    };

    getParametersFromForm = () => {
        let { regions } = this.state;

        return {
            codeRegion: _.get(regions, 'selected.codeRegion', null),
        };
    };

    isFormLoading = () => {
        let { regions } = this.state;
        return regions.loading;
    };

    isFormSynchronizedWithQuery = () => {
        let data = _(this.getParametersFromForm()).omitBy(_.isNil).value();
        return this.isFormLoading() || _.isEqual(data, this.getParametersFromQuery());
    };

    loadSelectBox = async (type, loader) => {
        this.setState({
            [type]: {
                selected: null,
                loading: true,
                results: [],
            },
        });

        let results = await loader();

        return new Promise(resolve => {
            this.setState({
                [type]: {
                    selected: null,
                    loading: false,
                    results,
                },
            }, () => resolve(results));
        });
    };

    updateSelectBox = (type, selected) => {
        return new Promise(resolve => {
            this.setState({
                [type]: {
                    ...this.state[type],
                    selected
                },
            }, resolve);
        });
    };

    resetForm = () => {
        this.setState({
            regions: {
                selected: null,
                ..._.pick(this.state.regions, ['results', 'loading']),
            },
        });
    };

    render() {

        let { regions } = this.state;
        let formSynchronizedWithQuery = this.isFormSynchronizedWithQuery();
        let { theme } = this.context;

        return (
            <div className="d-flex justify-content-center">
                <Form className="a-width-50">
                    <div className="d-flex justify-content-between align-items-end">
                        <div className="flex-grow-1 mr-2">
                            <label>Regions</label>
                            <Select
                                value={regions.selected}
                                options={regions.results}
                                loading={regions.loading}
                                optionKey="codeRegion"
                                label={option => option.nom}
                                placeholder={'Toutes les régions'}
                                trackingId="Regions"
                                onChange={option => {
                                    return this.updateSelectBox('regions', option);
                                }}
                            />
                        </div>
                        <Button
                            size="large"
                            color={theme.buttonColor}
                            onClick={() => this.props.onSubmit(this.getParametersFromForm())}
                            style={formSynchronizedWithQuery ? {} : { border: '2px solid' }}
                        >
                            {!formSynchronizedWithQuery && <i className="fas fa-sync a-icon"></i>}
                            Rechercher
                        </Button>
                    </div>
                </Form>
            </div>
        );
    }
}