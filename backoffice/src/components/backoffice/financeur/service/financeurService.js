import { _get } from '../../../../utils/http-client';

export const getRegions = () => {
    
    return _get(`/regions`);
};

export const getOrganisations = (idregion, codeFinanceur) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idregion}/organisations${query}`);
};

export const getAdvices = (idRegion, codeFinanceur, organisation, place, formation, filter, order, page) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (organisation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}organisation=${organisation}`;
    }
    if (place) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}place=${place}`;
    }
    if (formation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}formation=${formation}`;
    }
    if (filter) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}filter=${filter}&order=${order}`;
    }
    if (page !== null) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}page=${page}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/advices${query}`);
};

export const getOrganisationPlaces = (idRegion, codeFinanceur, siren) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/organisation/${siren}/places${query}`);
};

export const getFormations = (idRegion, codeFinanceur, siren, postalCode) => {
    let query = '';
    if (codeFinanceur) {
        query = `&codeFinanceur=${codeFinanceur}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/organisme_formateur/${siren}/trainings?postalCode=${postalCode}${query}`);
};

export const getOrganisationLieuTrainingSessions = (siren, idTraining, postalCode) => {
    return _get(`/backoffice/financeur/organismes_formateurs/${siren}/training/${idTraining}/sessions?postalCode=${postalCode}`);
};

export const getInventory = (idRegion, codeFinanceur, organisation, place, formation) => {
    let query = '';
    if (codeFinanceur) {
        query = `?codeFinanceur=${codeFinanceur}`;
    }
    if (organisation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}organisation=${organisation}`;
    }
    if (place) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}place=${place}`;
    }
    if (formation) {
        let prefix = '&';
        if (query === '') {
            prefix = '?';
        }
        query += `${prefix}formation=${formation}`;
    }
    return _get(`/backoffice/financeur/region/${idRegion}/inventory${query}`);
};
