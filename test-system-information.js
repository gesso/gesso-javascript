const si = require("systeminformation");

// si.version()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// si.time()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// promises style - new since version 3
// si.cpu()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// promises style - new since version 3
si.system()
  .then(data => {
    console.log(data)
    // TODO: Use this UUID to uniquely identify the host but provide a stable
    //   hardware-based identifier.
    console.log(`System UUID: ${data.uuid}`)
  })
  .catch(error => console.error(error));
    

// si.battery()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// si.baseboard()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// si.bios()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));  

// si.mem()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// si.memLayout()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// si.graphics()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// si.getAllData()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));