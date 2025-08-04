import axios from "axios";
import { getEnvVariables } from "../helpers/getEnvVar";

const { VITE_API_URL } = getEnvVariables();


const noizzyApi = axios.create({
    baseURL: VITE_API_URL
});


//Todo: configure interceptors


export default noizzyApi;