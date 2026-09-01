import apiClient from './apiClient';
import {API_ROUTES} from '../config/routes';

const contentService = {
  getLegalContent: slug =>
    apiClient.get(API_ROUTES.content.legal(slug)),
};

export default contentService;