// jwtAuth.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
const JwtAuthContext = createContext();
import { ApiManager, authenticatedRequest } from './ApiManager';


export const JwtAuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [jwtToken, setJwtToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);

    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchJwtToken = async () => {
            const storedJwtToken = await AsyncStorage.getItem('jwtToken');
            const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

            if (!storedJwtToken || !storedRefreshToken) {
                // Tangani kasus ketika token tidak tersedia di AsyncStorage
                console.log("Token tidak tersedia di AsyncStorage");
                return;
            }

            if (storedJwtToken && storedRefreshToken) {
                try {
                    const response = await authenticatedRequest('/api/v1/auth/users/profil', "GET",);
                    if (response.status === 200 ) {
                        console.log("Token masih valid.");
                        setIsLoggedIn(true);
                        // router.replace('(tabsinstructor)');
                        //route.replace('(instructor/addGrade/1)')
                    }
                    // if (response.role == "TRAINEE" || response.role == "TRAINEE_INSTRUCTOR") {
                    //     router.push('(tabs)');
                    // } else if (response.role == "INSTRUCTOR") {
                    //     router.push('(tabsinstructor)');
                    // }

                    // console.log("Token kedaluwarsa, melakukan refresh token...");
                    // const refreshResponse = await refreshTokenRequest(storedRefreshToken);
                    // console.log(refreshResponse);
                    // if (refreshResponse && refreshResponse.token) {
                    //     console.log("Refresh token berhasil.");
                    //     // Refresh successful, save the new JWT token and refresh token
                    //     await AsyncStorage.setItem('jwtToken', refreshResponse.token);
                    //     await AsyncStorage.setItem('refreshToken', refreshResponse.refreshToken);

                    //     setJwtToken(refreshResponse.token);
                    //     setRefreshToken(refreshResponse.refreshToken);

                    //     // Check if the newly refreshed JWT token is valid
                    //     const response = await authenticatedRequest('/api/v1/auth/users/profil', "GET", refreshResponse.token);
                    //     if (response.id_users) {
                    //         console.log("Token baru masih valid setelah refresh.");
                    //         setIsLoggedIn(true);
                    //         router.replace('(tabsinstructor)');
                    //     } else {
                    //         console.log("Token baru tidak valid setelah refresh.");
                    //         //logout();
                    //     }
                    // }


                } catch (error) {
                    console.log('Error checking JWT token validity:', error.message);
                   //logout();
                }
            }
        };

        fetchJwtToken();
    }, []);


    // useEffect(() => {
    //     const fetchJwtToken = async () => {
    //         try {
    //             const storedJwtToken = await AsyncStorage.getItem('jwtToken');
    //             const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

    //             if (!storedJwtToken || !storedRefreshToken) {
    //                 console.log("Token tidak tersedia di AsyncStorage");
    //                 return;
    //             }
             

    //             let parsedJwtToken, parsedRefreshToken;

    //             try {
    //                 parsedJwtToken = JSON.parse(JSON.stringify(storedJwtToken));
    //                 parsedRefreshToken = JSON.parse(JSON.stringify(storedRefreshToken));

    //                 // Lakukan logika selanjutnya di sini setelah berhasil mem-parse JSON
    //             } catch (error) {
    //                 console.log('Error parsing JSON:', error.message);
    //                 // Lakukan penanganan kesalahan di sini, misalnya, menggunakan nilai default atau menangani token yang tidak valid
    //                 return;
    //             }

    //             // Mendapatkan waktu kedaluwarsa token
    //             const tokenExpiration = new Date(parsedJwtToken.expiresAt);
    //             const currentTime = new Date();

    //             console.log(tokenExpiration);

    //             // Periksa apakah token kedaluwarsa atau hampir kedaluwarsa
    //             if (tokenExpiration < currentTime) {
    //                 console.log("Token telah kedaluwarsa atau hampir kedaluwarsa, melakukan refresh token...");

    //                 const refreshResponse = await refreshTokenRequest(parsedRefreshToken);

    //                 if (refreshResponse && refreshResponse.token) {
    //                     console.log("Refresh token berhasil.");

    //                     // Simpan token baru dan token refresh baru di AsyncStorage
    //                     await AsyncStorage.setItem('jwtToken', JSON.stringify(refreshResponse.token));
    //                     await AsyncStorage.setItem('refreshToken', JSON.stringify(refreshResponse.refreshToken));

    //                     // Lakukan sesuatu dengan token baru, seperti mengatur state isLoggedIn menjadi true
    //                     setIsLoggedIn(true);
    //                 } else {
    //                     console.log("Gagal memperbarui token.");
    //                     // Lakukan sesuatu jika gagal memperbarui token, seperti logout
    //                     // logout();
    //                 }
    //             } else {
    //                 console.log("Token masih valid.");
    //                 router.replace('(tabsinstructor)');
    //                 setIsLoggedIn(true);
    //             }
    //         } catch (error) {
    //             console.log('Error:', error.message);
    //             // Tangani kesalahan jika terjadi
    //         }
    //     };

    //     fetchJwtToken();
    // }, []);


    const login = async (email, password, onLoginFailed) => {
        try {
            const response = await ApiManager.post('/api/v1/auth/signin', {
                email,
                password,
            });
            if (response.data.token) {
                console.log(response.data.token);
                await AsyncStorage.setItem('jwtToken', response.data.token);
                setJwtToken(response.data.token);

                await AsyncStorage.setItem('refreshToken', response.data.refreshToken);

                // Save the user data in the AsyncStorage
                await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.users));

                // Set the state to indicate successful login
                setIsLoggedIn(true);
                setJwtToken(response.data.token);
                setRefreshToken(response.data.refresh_token);
                // router.replace('(tabs)');

                if (response.data.users.role === "TRAINEE" || response.data.users.role === 'TRAINEE_INSTRUCTOR' || response.data.users.role === 'TRAINEE_CPTS') {
                    router.push('(tabs)');
                } else if (response.data.users.role === 'INSTRUCTOR' || response.data.users.role === 'INSTRUCTOR_CPTS') {
                    router.push('(tabsinstructor)');
                } else if (response.data.users.role === 'CPTS') {
                    router.push('(tabscpts)');
                }
            }

        } catch (error) {
            console.log('Login failed:' + error.message);
            if (onLoginFailed) {
                onLoginFailed('Invalid Email or Password');
            }
        }
    };

    const refreshTokenRequest = async (refreshToken) => {
        try {
            const response = await ApiManager.post('/api/v1/auth/refresh', {
                token: refreshToken,
            });

            return response.data;
        } catch (error) {
            console.log('Refresh token request failed:', error.message);
            return { success: false };
        }
    };

    const logout = async () => {
        try {
            // Remove the JWT token from the AsyncStorage
            await AsyncStorage.removeItem('jwtToken');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('userInfo');

            // Clear the Authorization header
            delete axios.defaults.headers.common['Authorization'];


            // Set the state to indicate successful logout
            setIsLoggedIn(false);
            console.log("berhasil logout");
            console.log(await AsyncStorage.getItem('jwtToken'));
            setJwtToken(null);
            router.replace('/');
        } catch (error) {
            console.error('Logout failed:', error.message);
        }
    };

    return (
        <JwtAuthContext.Provider value={{ isLoggedIn, jwtToken, login, logout }}>
            {children}
        </JwtAuthContext.Provider>
    );
};

export const useJwtAuth = () => {
    const context = React.useContext(JwtAuthContext);
    if (!context) {
        throw new Error('useJwtAuth must be used within a JwtAuthProvider');
    }
    return context;
};