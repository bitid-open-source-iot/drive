var Q = require('q');
var fs = require('fs');
var chai = require('chai');
var fetch = require('node-fetch');
var expect = require('chai').expect;
var should = require('chai').should();
var config = require('./config.json');
var FormData = require('form-data');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

var token = null;
var fileId = null;

describe('Files', function () {
    it('/drive/files/add', function (done) {
        this.timeout(5000);

        tools.api.files.add()
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
                    result.should.have.property('size');
                    result.should.have.property('type');
                    result.should.have.property('slice');
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
                    result[0].should.have.property('role');
                    result[0].should.have.property('name');
                    result[0].should.have.property('data');
                    result[0].should.have.property('size');
                    result[0].should.have.property('users');
                    result[0].should.have.property('appId');
                    result[0].should.have.property('token');
                    result[0].should.have.property('fileId');
                    result[0].should.have.property('mimetype');
                    result[0].should.have.property('serverDate');
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
                    expect(result.updated).to.be.above(0);
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
        this.timeout(50005000500050005000);

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
                    expect(result.deleted).to.be.above(0);
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
            add: () => {
                var deferred = Q.defer();

                fs.readFile(__dirname + '/file.txt', (err, data) => {
                    if (err) {
                        deferred.resolve(err);
                    } else {
                        const form = new FormData();

                        form.append('uploads[]', data, 'file.txt');

                        const url = ['/drive/files/add?', 'userId', '=', config.userId, '&', 'appId', '=', config.appId].join('');

                        tools.upload(url, form).then(deferred.resolve, deferred.resolve);
                    };
                });

                return deferred.promise;
            },
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
                        'name',
                        'data',
                        'size',
                        'users',
                        'appId',
                        'token',
                        'fileId',
                        'mimetype',
                        'serverDate',
                        'organizationOnly'
                    ]
                });
            },
            share: () => {
                return tools.post('/drive/files/share', {
                    'role': 4,
                    'userId': 0,
                    'fileId': fileId
                });
            },
            update: () => {
                return tools.post('/drive/files/update', {
                    'name': 'tested.txt',
                    'fileId': fileId
                });
            },
            delete: () => {
                return tools.post('/drive/files/delete', {
                    'fileId': fileId
                });
            },
            unsubscribe: () => {
                return tools.post('/drive/files/unsubscribe', {
                    'userId': 0,
                    'fileId': fileId
                });
            },
            changeowner: () => {
                return tools.post('/drive/files/change-owner', {
                    'userId': 0,
                    'fileId': fileId
                });
            },
            updatesubscriber: () => {
                return tools.post('/drive/files/update-subscriber', {
                    'role': 2,
                    'userId': 0,
                    'fileId': fileId
                });
            }
        },
        healthcheck: () => {
            return tools.put('/health-check', {});
        }
    },
    get: async (url, payload) => {
        var deferred = Q.defer();

        let params = [];

        Object.keys(payload).map(key => {
            if (typeof (payload[key]) == 'string' || typeof (payload[key]) == 'number') {
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

        const result = await response.blob();

        deferred.resolve(result);

        return deferred.promise;
    },
    put: async (url, payload) => {
        var deferred = Q.defer();

        payload.header = {
            'appId': config.appId,
            'userId': config.userId
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
            'appId': config.appId,
            'userId': config.userId
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