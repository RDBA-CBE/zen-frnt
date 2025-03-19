import instance from "@/utils/axios.utils";

const session = {
  list: (page: any, body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/events/?page=${page}`;
      if (body.search) {
        url += `&title=${encodeURIComponent(body.search)}`;
      }
      if (body.end_date) {
        url += `&end_date=${encodeURIComponent(body.end_date)}`;
      }
      if (body.start_date) {
        url += `&start_date=${encodeURIComponent(body.start_date)}`;
      }
      if (body.lounge_type) {
        url += `&lounge_type=${encodeURIComponent(body.lounge_type)}`;
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

  create: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/events/`;
      instance()
        .post(url, data)
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

  update: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/events/${id}/`;

      instance()
        .patch(url, data)
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
      let url = `zen/events/${id}/`;
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

  details: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/events/${id}/`;
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

  dropdownLoungelist: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/events/?page_param=false&is_future=true`;
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

  registrationList: (page: any, body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/event-registrations/?page=${page}`;
      if (body.search) {
        url += `&registration_id=${encodeURIComponent(body.search)}`;
      }
      if (body.event) {
        url += `&event=${encodeURIComponent(body.event)}`;
      }
      if (body.start_date) {
        url += `&registration_date_before=${encodeURIComponent(body.start_date)}`;
      }
      if (body.start_date) {
        url += `&registration_date_after=${encodeURIComponent(body.start_date)}`;
      }
      if (body.lounge_status) {
        url += `&registration_status=${encodeURIComponent(body.lounge_status)}`;
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

  cancelRegistrationList: (page: any, body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/event-registrations/?page=${page}&registration_status=Failed`;
      if (body.search) {
        url += `&registration_id=${encodeURIComponent(body.search)}`;
      }
      if (body.event) {
        url += `&event=${encodeURIComponent(body.event)}`;
      }
      if (body.start_date) {
        url += `&registration_date_before=${encodeURIComponent(body.start_date)}`;
      }
      if (body.start_date) {
        url += `&registration_date_after=${encodeURIComponent(body.start_date)}`;
      }
      // if (body.lounge_status) {
      //   url += `&registration_status=${encodeURIComponent(body.lounge_status)}`;
      // }

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


  registrationDetails: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/event-registrations/${id}/`;

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

  singleUserRegistrationList: (page: any, body: any, userID: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/event-registrations/?page=${page}&user=${userID}`;
      if (body.search) {
        url += `&registration_id=${encodeURIComponent(body.search)}`;
      }
      if (body.event) {
        url += `&event=${encodeURIComponent(body.event)}`;
      }
      if (body.start_date) {
        url += `&registration_date_before=${encodeURIComponent(body.start_date)}`;
      }
      if (body.start_date) {
        url += `&registration_date_after=${encodeURIComponent(body.start_date)}`;
      }
      if (body.lounge_status) {
        url += `&registration_status=${encodeURIComponent(body.lounge_status)}`;
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
  createRegistration: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/event-registrations/`;
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

  updateRegistration: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/event-registrations/${id}/`;

      instance()
        .patch(url, data)
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


  deleteRegistration: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/event-registrations/${id}/`;
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


  detailsRegistration: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/event-registrations/${id}/`;
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


  // student
  calendar: (body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `zen/events/?pagination=false&is_future=true`;
      if (body.lounge_type) {
        url += `&lounge_type=${encodeURIComponent(body.lounge_type)}`;
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

};

export default session;
