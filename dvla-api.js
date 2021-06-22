const axios = require('axios');

const getDetails = (registrationNumber, key) => {
    const url ='https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles'
    const data = {
        "registrationNumber": registrationNumber
    }
    const headers = {
        "Content-Type": "application/json",
        "x-api-key": key
      }
    return axios.post(url, data, { headers}).then(response => this.res = response.data)
}

function convertPlate(reg){
    let plateSub = reg.substring(0,3)
    if(hasNumber(plateSub)){
      // XXXX XXX
      return `${reg.substring(0,4)} ${reg.substring(4)}`
    } else {
      // XXX XXXX
      return `${reg.substring(0,3)} ${reg.substring(3)}`
    }
}

function hasNumber(myString) {
    return /\d/.test(myString);
}

module.exports = function(RED) {
    function DvlaApiNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            let REG = msg.payload.split(",").map(function(e) {return e.trim()})
            let KEY = msg.key
            Promise.all(REG.map(function(e){
                return getDetails(e, KEY)
            }))
            .then((values) => {
                let cars = []
                for(const value of values){
                    cars.push(value)
                }
                msg.payload = cars
                node.send(msg);
            })
        });
    }
    RED.nodes.registerType("dvla-api",DvlaApiNode);
}