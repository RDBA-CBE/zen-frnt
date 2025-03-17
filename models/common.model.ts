import instance from "@/utils/axios.utils";

const Common = {
  groups: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/groups/`;
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

  profileType: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `musicforum/user_groups/`;
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

  categoryList: ()=>{
    let promise = new Promise((resolve, reject) => {
    let url = `musicforum/event_categories/`;
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

  eventTypesList: ()=>{
    let promise = new Promise((resolve, reject) => {
    let url = `musicforum/event_types/`;
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

  skillcatList: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `musicforum/skill_categories/`;
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

  // skillList: (body) => {
  //   let promise = new Promise((resolve, reject) => {
  //     let url = `musicforum/skills/`;

  //     if (body.skill_category_id) {
  //       url += `?skill_category_id=${body.skill_category_id}`;
  //     }
  //     instance()
  //       .get(url)
  //       .then((res) => {
  //         resolve(res.data);
  //       })
  //       .catch((error) => {
  //         console.log("errorsss: ", error);
  //         if (error.response) {
  //           reject(error.response.data.error);
  //         } else {
  //           reject(error);
  //         }
  //       });
  //   });
  //   return promise;
  // },

  skillLevelList: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `musicforum/skill_levels/`;
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

  genderList:() => {
    let promise = new Promise((resolve, reject) => {
      let url = `musicforum/skill_levels/`;
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

  locationList:() =>{
    let promise = new Promise((resolve, reject) => {
    let url = `musicforum/locations/`;
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

  musician: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `musicforum/musicians/`;

      // if (body.user_id) {
      //   url += `?user_id=${body.user_id}`;
      // }
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

  troupe: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `musicforum/troupes/`;

      // if (body.user_id) {
      //   url += `?user_id=${body.user_id}`;
      // }
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

export default Common;
