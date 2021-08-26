const Q = require('q');
const fs = require('fs');
const chai = require('chai');
const fetch = require('node-fetch');
const expect = require('chai').expect;
const should = require('chai').should();
const subset = require('chai-subset');
const config = require('./config.json');
const FormData = require('form-data');

chai.use(subset);

var token = null;
var fileId = null;

describe('Files', function () {
    it('/drive/files/upload', function (done) {
        this.timeout(500000);

        tools.api.files.upload()
            .then((result) => {
                try {
                    token = result.token;
                    fileId = result.fileId;
                    result.should.have.property('token');
                    result.should.have.property('fileId');
                    done();
                } catch (e) {
                    done(e);
                };
            }, (err) => {
                try {
                    done(err);
                } catch (e) {
                    done(e);
                };
            });
    });

    it('/drive/files/get', function (done) {
        this.timeout(5000);

        tools.api.files.get()
            .then((result) => {
                try {
                    done();
                } catch (e) {
                    done(e);
                };
            }, (err) => {
                try {
                    done(err);
                } catch (e) {
                    done(e);
                };
            });
    });

    it('/drive/files/list', function (done) {
        this.timeout(5000);

        tools.api.files.list()
            .then((result) => {
                try {
                    token = result[0].token;
                    fileId = result[0].fileId;
                    result[0].should.have.property('role');
                    result[0].should.have.property('appId');
                    result[0].should.have.property('users');
                    result[0].should.have.property('token');
                    result[0].should.have.property('fileId');
                    result[0].should.have.property('aliases');
                    result[0].should.have.property('filename');
                    result[0].should.have.property('uploadDate');
                    result[0].should.have.property('serverDate');
                    result[0].should.have.property('contentType');
                    result[0].should.have.property('organizationOnly');
                    done();
                } catch (e) {
                    done(e);
                };
            }, (err) => {
                try {
                    done(err);
                } catch (e) {
                    done(e);
                };
            });
    });

    it('/drive/files/update', function (done) {
        this.timeout(5000);

        tools.api.files.update()
            .then((result) => {
                try {
                    result.should.have.property('updated');
                    expect(result.updated).to.equal(1);
                    done();
                } catch (e) {
                    done(e);
                };
            }, (err) => {
                try {
                    done(err);
                } catch (e) {
                    done(e);
                };
            });
    });

    it('/drive/files/share', function (done) {
        this.timeout(5000);

        tools.api.files.share()
            .then((result) => {
                try {
                    result.should.have.property('updated');
                    expect(result.updated).to.equal(1);
                    done();
                } catch (e) {
                    done(e);
                };
            }, (err) => {
                try {
                    done(err);
                } catch (e) {
                    done(e);
                };
            });
    });

    it('/drive/files/update-subscriber', function (done) {
        this.timeout(5000);

        tools.api.files.updatesubscriber()
            .then((result) => {
                try {
                    result.should.have.property('updated');
                    expect(result.updated).to.equal(1);
                    done();
                } catch (e) {
                    done(e);
                };
            }, (err) => {
                try {
                    done(err);
                } catch (e) {
                    done(e);
                };
            });
    });

    it('/drive/files/unsubscribe', function (done) {
        this.timeout(5000);

        tools.api.files.unsubscribe()
            .then((result) => {
                try {
                    result.should.have.property('updated');
                    expect(result.updated).to.equal(1);
                    done();
                } catch (e) {
                    done(e);
                };
            }, (err) => {
                try {
                    done(err);
                } catch (e) {
                    done(e);
                };
            });
    });

    it('/drive/files/delete', function (done) {
        this.timeout(5000);

        tools.api.files.delete()
            .then((result) => {
                try {
                    result.should.have.property('deleted');
                    expect(result.deleted).to.equal(1);
                    done();
                } catch (e) {
                    done(e);
                };
            }, (err) => {
                try {
                    done(err);
                } catch (e) {
                    done(e);
                };
            });
    });
});

describe('Health Check', function () {
    it('/', function (done) {
        this.timeout(5000);

        tools.api.healthcheck()
            .then((result) => {
                try {
                    result.should.have.property('uptime');
                    result.should.have.property('memory');
                    result.should.have.property('database');
                    done();
                } catch (e) {
                    done(e);
                };
            }, (err) => {
                try {
                    done(err);
                } catch (e) {
                    done(e);
                };
            });
    });
});

var tools = {
    api: {
        files: {
            get: () => {
                return tools.get('/drive/files/get', {
                    'token': token,
                    'fileId': fileId
                });
            },
            list: () => {
                return tools.post('/drive/files/list', {
                    'filter': [
                        'role',
                        'appId',
                        'users',
                        'token',
                        'fileId',
                        'aliases',
                        'filename',
                        'uploadDate',
                        'serverDate',
                        'contentType',
                        'organizationOnly'
                    ]
                });
            },
            share: () => {
                return tools.post('/drive/files/share', {
                    'role': 4,
                    'email': 'shared@email.com',
                    'fileId': fileId
                });
            },
            update: () => {
                return tools.post('/drive/files/update', {
                    'fileId': fileId,
                    'description': 'Mocha Test Report Updated'
                });
            },
            upload: () => {
                var deferred = Q.defer();

                fs.readFile(__dirname + '/file.txt', (err, data) => {
                    if (err) {
                        deferred.resolve(err);
                    } else {
                        const form = new FormData();

                        form.append('uploads[]', data, 'file.txt');

                        const url = ['/drive/files/upload?', 'email', '=', config.email, '&', 'appId', '=', config.appId].join('');

                        tools.upload(url, form).then(deferred.resolve, deferred.resolve);
                    };
                });

                return deferred.promise;
            },
            delete: () => {
                return tools.post('/drive/files/delete', {
                    'fileId': fileId
                });
            },
            unsubscribe: () => {
                return tools.post('/drive/files/unsubscribe', {
                    'email': 'shared@email.com',
                    'fileId': fileId
                });
            },
            updatesubscriber: () => {
                return tools.post('/drive/files/update-subscriber', {
                    'role': 2,
                    'email': 'shared@email.com',
                    'fileId': fileId
                });
            }
        },
        healthcheck: () => {
            var deferred = Q.defer();

            tools.put('/health-check', {})
                .then(deferred.resolve, deferred.resolve);

            return deferred.promise;
        }
    },
    get: async (url, payload) => {
        var deferred = Q.defer();

        let params = [];

        Object.keys(payload).map(key => {
            if (typeof (payload[key]) == 'string') {
                params.push(key + '=' + payload[key]);
            };
        });

        params = '?' + params.join('&');

        const response = await fetch(config.drive + url + params, {
            'headers': {
                'Authorization': JSON.stringify(config.token),
            },
            'method': 'GET'
        });

        deferred.resolve(response);

        return deferred.promise;
    },
    put: async (url, payload) => {
        var deferred = Q.defer();

        payload.header = {
            'email': config.email,
            'appId': config.appId
        };

        payload = JSON.stringify(payload);

        const response = await fetch(config.drive + url, {
            'headers': {
                'Accept': '*/*',
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': JSON.stringify(config.token),
                'Content-Length': payload.length
            },
            'body': payload,
            'method': 'PUT'
        });

        const result = await response.json();

        deferred.resolve(result);

        return deferred.promise;
    },
    post: async (url, payload) => {
        var deferred = Q.defer();

        payload.header = {
            'email': config.email,
            'appId': config.appId
        };

        payload = JSON.stringify(payload);

        const response = await fetch(config.drive + url, {
            'headers': {
                'Accept': '*/*',
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': JSON.stringify(config.token),
                'Content-Length': payload.length
            },
            'body': payload,
            'method': 'POST'
        });

        const result = await response.json();

        deferred.resolve(result);

        return deferred.promise;
    },
    upload: async (url, payload) => {
        var deferred = Q.defer();

        const response = await fetch(config.drive + url, {
            'headers': {
                'Authorization': JSON.stringify(config.token),
            },
            'body': payload,
            'method': 'POST'
        });

        const result = await response.json();

        deferred.resolve(result);

        return deferred.promise;
    }
};