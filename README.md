# biTid Drive

The **Drive Application/Service** is awesome

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* [Node](https://nodejs.org)
* [MongoDB](https://www.mongodb.com/download-center/community)

### Installing

```
  $ git clone git@github.com:bitid-open-source-iot/drive.git
  $ cd drive/
  $ cp config.template.json config.json
  # swap out "xxx" for real values
  $ mkdir logs
  $ npm i
  $ nodemon
```

## Testing

We use [Mocha](https://mochajs.org) together with [Chai](https://www.chaijs.com) to run automated tests against all our apis. Complete the procedure below to test your version of Drive:

#### Installation
```
  $ cd test/
  $ cp config.template.json config.json
  $ nano config.json
  # swap out "xxx" for real values
```

#### Running
```
  # open terminal
  
  $ cd drive/
  # cd into project folder
  
  $ nodemon drive.js
  # run the service
  
  # open new terminal
  
  $ cd drive/test
  # cd into project's test folder
  
  $ mocha
  # run mocha test
```

## Deployment

```
  $ cd drive/
  $ nano config.json
  # swap out "xxx" for real values
  # set production = true
  $ nodemon
```

## Built With

* [Node.js](https://nodejs.org) - Middleware
* [Angular](https://angular.io) - Application
* [MongoDB](https://www.mongodb.com) - Database


## Versioning

For the versions available, see the [tags on this repository](https://github.com/bitid-open-source-iot/drive/tags). 

## Authors

* [Shane Bowyer](https://github.com/shanebowyer)
* [Clayton Constant](https://github.com/claytoncc)

## License

This project is licensed under the Apache License (Version 2) - see the [LICENSE](LICENSE) file for details


# Docker local testing
docker run --rm --network host --name=drive --env-file /home/shane/Documents/GitCode/opensource/drive/.envDocker shanebowyer/drive:master
