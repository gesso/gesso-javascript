const router = {
  functions: {
    get: "GET /gesso/functions",
    executeByName: "POST /gesso/functions/:fname",
    executenById: "POST /gesso/functions/:fid",
    // TODO: Next?
    new: "POST /gesso/functions",
    addObserver: "POST /gesso/functions/:fid/observers",
    removeObserver: "POST /gesso/functions/:fid/observers/:oid",
    getInputType: "GET /gesso/functions/:fid/inputs",
    edit: "PATCH /gesso/functions/:fid/script",
    delete: "POST /gesso/functions/:fid",
    // TODO: After previous?
    observeOutputPropertyOnInput: "POST /gesso/functions/:fid/inputs/:propertyName/input",
  }
}