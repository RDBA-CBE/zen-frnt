import axios from "axios";

export const instance = () => {
  const data = axios.create({
    baseURL: "https://zenbkad.zenwellnesslounge.com/api/",
  });

  data.interceptors.request.use(async function (config) {
    // config.headers['authorization'] = `Token ${accessToken}`;
    const accessToken = localStorage.getItem("zentoken");
    if (accessToken) {
      config.headers["authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  });

  return data;
};

export default instance;

// import axios from 'axios';

// export const instance = () => {
//     // let baseURL = 'http://121.200.52.133:8000/api/';
//     let baseURL = "https://zenbkad.zenwellnesslounge.com/api/";

//     const api = axios.create({
//         baseURL,
//     });

//     let refreshPromise = null;

//     const getAccessToken = () => localStorage.getItem('zentoken');
//     const getRefreshToken = () => localStorage.getItem('refreshToken');
//     const setAccessToken = (token) => localStorage.setItem('zentoken', token);
//     const setRefreshToken = (token) => localStorage.setItem('refreshToken', token);
//     const clearTokens = () => {
//         localStorage.removeItem('zentoken');
//         localStorage.removeItem('refreshToken');
//     };

//     const redirectToLogin = () => {
//         clearTokens();
//         window.location.href = '/';
//     };
//     const refreshToken = () => {
//         if (!refreshPromise) {
//             refreshPromise = new Promise((resolve, reject) => {
//                 const refreshToken = getRefreshToken();
//                 console.log('Stored refreshToken:', refreshToken);

//                 if (!refreshToken) {
//                     console.log('No refresh token found. Redirecting to login...');
//                     clearAuthData();
//                     redirectToLogin();
//                     reject('No refresh token');
//                     return;
//                 }

//                 axios
//                     .post(`${baseURL}auth/login/refresh/`, { refresh: refreshToken })
//                     .then((response) => {
//                         console.log('Refresh token response:', response.data);

//                         setAccessToken(response.data.access);
//                         setRefreshToken(response.data.refresh);

//                         resolve(response.data.access);
//                     })
//                     .catch((error) => {
//                         if (error.response) {
//                             console.error('Refresh token failed:', error.response.data);

//                             if (error.response.data.code === 'token_not_valid') {
//                                 console.log('Token expired. Logging out...');
//                                 clearAuthData();
//                                 redirectToLogin();
//                             }
//                         } else if (error.request) {
//                             console.error('No response received:', error.request);
//                         } else {
//                             console.error('Error setting up request:', error.message);
//                         }

//                         reject(error);
//                     })
//                     .finally(() => {
//                         refreshPromise = null;
//                     });
//             });
//         }

//         return refreshPromise;
//     };

//     const clearAuthData = () => {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//     };

//     api.interceptors.request.use(
//         (config) => {
//             const token = getAccessToken();
//             if (token) {
//                 config.headers['Authorization'] = `Bearer ${token}`;
//             }
//             return config;
//         },
//         (error) => Promise.reject(error)
//     );

//     api.interceptors.response.use(
//         (response) => response,
//         (error) => {
//             const originalRequest = error.config;

//             if (error.response?.status === 401 && !originalRequest._retry) {
//                 originalRequest._retry = true;

//                 return refreshToken()
//                     .then((newAccessToken) => {
//                         if (!newAccessToken) {
//                             redirectToLogin();
//                             return Promise.reject('Failed to refresh token');
//                         }
//                         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//                         return api(originalRequest);
//                     })
//                     .catch((err) => {
//                         redirectToLogin();
//                         return Promise.reject(err);
//                     });
//             }

//             return Promise.reject(error);
//         }
//     );

//     return api;
// };

// export default instance;

// import axios from 'axios';

// export const instance = () => {
//   const data = axios.create({
//     baseURL: 'http://121.200.52.133:8000/api/',

//   });

//   data.interceptors.request.use(async function (config) {
//     const accessToken = localStorage.getItem('crmToken');
//     if (accessToken) {
//       config.headers['authorization'] = `Bearer ${accessToken}`;
//     }
//     return config;
//   });

//   return data;
// };

// export default instance;x
