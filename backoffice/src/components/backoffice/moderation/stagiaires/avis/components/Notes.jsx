import React from 'react';
import PropTypes from 'prop-types';
import './Notes.scss';

const Note = ({ label, note }) => {
    return (
        <div>
            <span>{label}</span>
            <span className="float-right">{note}/5<i className="fas fa-star pl-1" /></span>
            <br />
        </div>
    );
};
Note.propTypes = { label: PropTypes.string.isRequired, note: PropTypes.number.isRequired };

export default class Notes extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showDetails: false,
        };
    }

    createCard = (label, note) => {
        return (
            <div className="mx-3">
                <div className="title">{label}</div>
                <div className="text">
                    {note}/5 <i className="fas fa-star" />
                </div>
            </div>
        );
    };

    toggleDetails = () => {
        this.setState({ showDetails: !this.state.showDetails });
    };

    render() {
        let { rates } = this.props.avis;

        return (
            <div className="Notes">
                <button
                    type="button"
                    className="btn btn-sm"
                    onClick={this.toggleDetails}>
                    Détails des notes <i className={`fas fa-angle-${this.state.showDetails ? 'up' : 'down'}`} />
                </button>
                {this.state.showDetails &&
                <div className="mx-0 d-flex justify-content-center details">
                    {this.createCard('Accueil', rates.accueil)}
                    {this.createCard('Contenu', rates.contenu_formation)}
                    {this.createCard('Formateurs', rates.equipe_formateurs)}
                    {this.createCard('Moyens', rates.moyen_materiel)}
                    {this.createCard('Accompagnement', rates.accompagnement)}
                </div>
                }
            </div>
        );
    }
}
