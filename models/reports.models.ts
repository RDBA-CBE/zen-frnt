import instance from "@/utils/axios.utils";

const reports = {
  reportType: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/reports/?type=${data}`;

      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          console.log("errorsss: ", error);
          if (error.response) {
            reject(error.response.data.error);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  filter: (data: any, body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/reports/?type=${data}`;

      if (body.category) {
        url += `&category=${body.category}`;
      }

      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          console.log("errorsss: ", error);
          if (error.response) {
            reject(error.response.data.error);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },
};

export default reports;
