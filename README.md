# node-red-contrib-dvla-api

![npm](https://img.shields.io/npm/dt/node-red-contrib-dvla-api?label=Downloads&logo=NPM&style=flat-square) ![npm](https://img.shields.io/npm/v/node-red-contrib-dvla-api?label=Version&logo=NPM&style=flat-square) ![NPM](https://img.shields.io/npm/l/node-red-contrib-dvla-api?style=flat-square) ![GitHub issues](https://img.shields.io/github/issues/adonnelly759/node-red-contrib-dvla-api?style=flat-square)

## Install
``` npm install node-red-contrib-dvla-api```

This dvla-api node can be used to obtain vehicle information from regiration plates from United Kingdom, and Northern Ireland.

The node allows to query either one registraion number or multiple registration numbers at one time by sepearting the plates by commas. eg. ```msg.payload = "PLATE,PLATE,PLATE"```

The node also takes the users API to query the DVLA API. eg ```msg.key = "xxx"```

The output from the node module returns an array of JSON objects like the below example:
```
{
  "artEndDate": "2025-02-28",
  "co2Emissions" : 135
  "colour" : "BLUE"
  "engineCapacity": 2494,
  "fuelType" : "PETROL"
  "make" : "ROVER"
  "markedForExport" : false
  "monthOfFirstRegistration" : "2004-12"
  "motStatus" : "No details held by DVLA"
  "registrationNumber" : "ABC1234"
  "revenueWeight" : 1640
  "taxDueDate" : "2007-01-01"
  "taxStatus" : "Untaxed"
  "typeApproval" : "N1"
  "wheelplan" : "NON STANDARD"
  "yearOfManufacture" : 2004
  "euroStatus": "EURO 6 AD"
  "realDrivingEmissions": "1"
  "dateOfLastV5CIssued": "2016-12-25"
}
```

### [Register for DVLA API!](https://developer-portal.driver-vehicle-licensing.api.gov.uk/apis/vehicle-enquiry-service/vehicle-enquiry-service-description.html#register-for-ves-api "Register for DVLA API")