import instance from "@/utils/axios.utils";

const user = {
  userList: (page: any, body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/users/?page=${page}`;
      if (body.search) {
        url += `&search=${encodeURIComponent(body.search)}`;
      }

      if (body?.group_name) {
        url += `&group_name=${encodeURIComponent(body?.group_name)}`;
      }
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },
  dropdownUserserList: (page:number) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/users/?page=${page}`;

      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  updateUser: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/users/${id}/`;
      instance()
        .patch(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  addUser: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = "auth/users/";
      instance()
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  getUserId: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/users/${id}/`;
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  delete: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/users/${id}/`;
      instance()
        .delete(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },
};

export default user;
