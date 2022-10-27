import * as https from "https";

export const postRequest = (path: string, data: any, token: string) => {
  return new Promise((resolve, reject) => {
    var options = {
      hostname: "multiv5.hanuultp.com",
      port: 443,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": JSON.stringify(data).length,
        Authorization: token,
      },
    };

    var req = https.request(options, (res) => {
      let data = "";
      res.on("data", (d) => {
        data += d;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
        });
      });
    });

    req.on("error", (e) => {
      console.log(e);
      reject(e);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
};

export const putRequest = (path: string, data: any, token: string) => {
    return new Promise((resolve, reject) => {
      var options = {
        hostname: "multiv5.hanuultp.com",
        port: 443,
        path: path,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": JSON.stringify(data).length,
          Authorization: token,
        },
      };
  
      var req = https.request(options, (res) => {
        let data = "";
        res.on("data", (d) => {
          data += d;
        });
  
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            data: data,
          });
        });
      });
  
      req.on("error", (e) => {
        console.log(e);
        reject(e);
      });
  
      req.write(JSON.stringify(data));
      req.end();
    });
  };

export const getRequest = (path: string, data: any, token: string) => {
  return new Promise((resolve, reject) => {
    var options = {
      hostname: "multiv5.hanuultp.com",
      port: 443,
      path: path,
      method: "GET",
      headers: {
        Authorization: token,
      },
    };

    var req = https.request(options, (res) => {
      let data = "";
      res.on("data", (d) => {
        data += d;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
        });
      });
    });

    req.on("error", (e) => {
      console.log(e);
      reject(e);
    });

    req.end();
  });
};

export const deleteRequest = (path: string, data: any, token: string) => {
  return new Promise((resolve, reject) => {
    var options = {
      hostname: "multiv5.hanuultp.com",
      port: 443,
      path: path,
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    };

    var req = https.request(options, (res) => {
      let data = "";
      res.on("data", (d) => {
        data += d;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
        });
      });
    });

    req.on("error", (e) => {
      console.log(e);
      reject(e);
    });

    req.end();
  });
};
