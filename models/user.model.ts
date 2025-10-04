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

      if (body?.available_from) {
        url += `&available_from=${encodeURIComponent(body?.available_from)}`;
      }

      if (body?.available_to) {
        url += `&available_to=${encodeURIComponent(body?.available_to)}`;
      }
      if (body?.is_active) {
        url += `&is_active=${encodeURIComponent(!body?.is_active)}`;
      }

      if (body?.is_open_to_be_mentor) {
        url += `&is_open_to_be_mentor=${encodeURIComponent(body.is_open_to_be_mentor == "Yes"?true:false)}`;
      }

      if (body?.group_name_exact) {
        url += `&group_name_exact=${encodeURIComponent(body.group_name_exact)}`;
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
  dropdownUserserList: (page: number, body = null) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/users/?page=${page}`;
      if (body?.search) {
        url += `&search=${encodeURIComponent(body?.search)}`;
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

  updateUserRole: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/user-groups/add/`;
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

  romoveUserRole: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/user-groups/remove/`;
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
