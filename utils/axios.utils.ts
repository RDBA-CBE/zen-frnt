import axios from 'axios';

export const instance = () => {
  const data = axios.create({
    // baseURL: "http://121.200.52.133:8001/api/",
    // baseURL: "https://vqbv6q92-8000.inc1.devtunnels.ms/api/"
    baseURL: "https://r97smzp6-8001.inc1.devtunnels.ms/api/"
    // baseURL:"https://vqbv6q92-8000.inc1.devtunnels.ms/api/"
  });

  data.interceptors.request.use(async function (config) {
 
      // config.headers['authorization'] = `Token ${accessToken}`;
      const accessToken = localStorage.getItem('token');
      if (accessToken) {
        config.headers['authorization'] = `Bearer ${accessToken}`;
      }
    return config;
  });

  return data;
};

export default instance;
