import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

axios.defaults.baseURL = 'http://192.168.155.154:8080';
axios.defaults.headers.post["Content-Type"] = "application/json";


const IMAGE_BASE_URL = `${axios.defaults.baseURL}/api/v1/images/`;

const ApiManager = axios.create({
    baseURL: 'http://192.168.155.154:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});


const authenticatedRequest = async (url, method, data = null, contentType = 'application/json') => {
    const token = await AsyncStorage.getItem('jwtToken');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': contentType 
    };

    try {
        const response = await ApiManager({
            url,
            method,
            data,
            headers,
        });

        return { status: response.status, data: response.data };
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
};

export { ApiManager, authenticatedRequest, IMAGE_BASE_URL };