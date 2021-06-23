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
    return axios.post(url, data, { headers}).then(response => this.res = response.data).catch(err => this.res = err)
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
        this.endpoint = RED.nodes.getNode(config.endpoint);
        var node = this;
        if(this.endpoint){
            node.on('input', function(msg) {
                let KEY = this.endpoint.key
                let REG = msg.payload.split(",").map(function(e) {return e.trim()})
                Promise.all(REG.map(function(e){
                    return getDetails(e, KEY)
                }))
                .then((values) => {
                    let cars = []
                    for(const value of values){
                        cars.push(value)
                    }

                    if(cars[0]["name"] === "Error"){
                        let error = `${cars[0]["response"].status}: ${cars[0]["response"].statusText}`
                        node.error(error)
                        node.status({fill:"red",shape:"ring",text:error});
                    } else {
                        msg.payload = cars
                        node.send(msg);
                        node.status({fill:"green",shape:"dot",text:"200: Successful"});
                    }
                })
            });
        } else {
            msg.error('No API Key configured.')
            node.send(msg)
        }
    }
    RED.nodes.registerType("dvla-api",DvlaApiNode);

    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.key = n.key;
    }
    RED.nodes.registerType("dvla-api-key-config",RemoteServerNode);
}
