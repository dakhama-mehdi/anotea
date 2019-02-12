import { _post, _get } from '../utils/http-client';

export const getTraineeInfo = token => _get(`/questionnaire/${token}`);

export const submitAvis = (token, avis) => _post(`/questionnaire/${token}`, avis);
