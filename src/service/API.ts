import axios from "axios";

export const API_URL = process.env.REACT_APP_API_URL;

if (API_URL === undefined)
    console.error('No API_URL provided.');

const API = axios.create({
    baseURL: API_URL,
    headers: {'Content-Type': 'multipart/form-data'}
});

API.interceptors.request.use(config => {
    if (config.data === undefined)
        return config;

    if (!(config.data instanceof FormData))
        config.data = toFormData(config.data);
    return config;
});

// create formdata from object
const toFormData = (object: any) => Object.keys(object).reduce((formData, key) => {
    formData.append(key, object[key]);
    return formData;
}, new FormData());

export default API;