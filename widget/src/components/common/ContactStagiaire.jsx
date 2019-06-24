import React, { Component } from 'react';
import _ from 'lodash';
import './ContactStagiaire.scss';
import Button from './library/Button';
import { saveContactStagiaire } from '../../services/widgetService';
import { getReferrerUrl } from '../../utils';
import Modal from './library/Modal';

export default class ContactStagiaire extends Component {


    constructor() {
        super();
        this.state = {
            showModal: false,
            error: false,
            form: this.getInitialForm(),
        };
    }

    getInitialForm() {
        return {
            question: '',
            contact: '',
            referrer: getReferrerUrl().href,
        };
    }

    async submit() {
        try {
            await saveContactStagiaire({ ...this.state.form });
            this.setState({ showModal: false, form: this.getInitialForm() });
        } catch (e) {
            console.log(e);
            this.setState({ error: 'Une erreur est survenue.' });
        }

    }

    render() {
        return (
            <div className="ContactStagiaire">
                {this.state.showModal &&
                <Modal
                    title="Contacter un stagiaire"
                    body={
                        <form>
                            <div className="form-group">
                                <label>Posez ici une question à un ancien stagiaire de cette formation.</label>
                                <textarea
                                    name="question"
                                    value={this.state.form.question}
                                    maxLength={500}
                                    rows="7"
                                    placeholder=""
                                    onChange={e => this.setState(_.merge(this.state, { form: { question: e.target.value } }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Indiquer une email ou un numéro de téléphone nous permettant de vous recontacter</label>
                                <input
                                    name="contact"
                                    type="texte"
                                    className="form-control"
                                    placeholder=""
                                    value={this.state.form.contact}
                                    onChange={e => this.setState(_.merge(this.state, { form: { contact: e.target.value } }))}
                                />

                            </div>
                            {this.state.error &&
                            <div className="error">{this.state.error}</div>
                            }
                        </form>
                    }
                    onClose={() => this.setState({ showModal: false })}
                    onConfirmed={() => this.submit()} />
                }
                <Button
                    size="medium"
                    onClick={() => this.setState({ showModal: !this.state.showModal })}>
                    Contacter un ancien stagiaire
                </Button>
            </div>
        );
    }
}
