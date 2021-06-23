const axios = require('axios');
const express = require('express')
const app = express()
const path = require("path")
const moment = require('moment')

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use('/static',express.static(path.join(__dirname, 'public')))
app.use('/vendor',express.static(path.join(__dirname, 'vendor')))
app.use('/js',express.static(path.join(__dirname, 'js')))
app.use('/css',express.static(path.join(__dirname, 'css')))
app.use(express.urlencoded({extended: false}))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function dvlaToMoment(date){
    if(typeof date === 'undefined'){
        return 999
    }
    let dvlaDate = moment(date)
    let now = moment()
    return dvlaDate.diff(now, 'days')
  }

  function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
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

function carClass(days){
    if(days === 999){
        return 'bg-secondary'
    }
    if(days < 30){
        return 'bg-danger'
    }
    if(days < 60){
        return 'bg-warning'
    }
    return 'bg-success'
}

function hasNumber(myString) {
    return /\d/.test(myString);
}



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

function hasNumber(myString) {
    return /\d/.test(myString);
}

module.exports = function(RED) {
    function DvlaDashboardNode(config){
        RED.nodes.createNode(this,config);
        this.endpoint = RED.nodes.getNode(config.endpoint);
        var node = this;
        if(this.endpoint){  
            app.get(`/${config.route}`, async (req, res) => {
                let KEY = this.endpoint.key
                let REG = this.endpoint.plates
                Promise.all(REG.map(function(e){
                    return getDetails(e, KEY)
                }))
                .then((values) => {
                    let cars = []
                    for(const value of values){
                        cars.push({
                            "class": carClass(dvlaToMoment(value.motExpiryDate)),
                            "make": value.make,
                            "registrationNumber": convertPlate(value.registrationNumber),
                            "motStatus": (value.motStatus) == "Valid" ? true : false,
                            "motDue": value.motExpiryDate,
                            "year": value.yearOfManufacture,
                            "motDaysTo": dvlaToMoment(value.motExpiryDate),
                            "taxStatus": (value.taxStatus) == "Taxed" ? true : false,
                            "taxDue": value.taxDueDate,
                            "taxDaysTo": dvlaToMoment(value.taxDueDate),
                        })
                    }
                    cars = cars.sort(dynamicSort("motDue"))
                    res.render("CarMot", {cars: cars, name: config.name})
                })
            })
            
            app.listen(parseInt(config.port), () => {
                node.status({fill:"green",shape:"dot",text:`Running on http://127.0.0.1:${config.port}`});
            })     
            node.on('close', function(){
                app.close()
                node.status({fill:"green",shape:"dot",text:`Nothing running`});
            })        
        }    
    }
    RED.nodes.registerType("dvla-dashboard",DvlaDashboardNode);

    function DvlaApiControlNode(config) {
        RED.nodes.createNode(this,config);
        this.endpoint = RED.nodes.getNode(config.endpoint);
        var node = this;
        if(this.endpoint){
            node.on('input', function(msg) {
                let KEY = this.endpoint.key
                let REG = this.endpoint.plates
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
    RED.nodes.registerType("dvla-control",DvlaApiControlNode);

    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.key = n.key;
        this.plates = n.plates;
    }
    RED.nodes.registerType("dvla-api-key-config",RemoteServerNode);
}
