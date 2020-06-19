var fs        = require('fs');
var Grid      = require('gridfs-stream');
var mongo     = require('mongodb');
var ObjectId  = require('mongodb').ObjectId;
 
var module = function() {
    var db = {
        call: (req, res) => {
            mongo.MongoClient.connect(__settings.mongodb.url, (err, database) => {
                var gfs = new Grid(database, mongo);

                gfs.findOne({
                    "_id": req.query.mediaId
                }, (err, file) => {
                    if (err) {
                        res.status(401).json({
                            'code':     503,
                            'message':  'Unknown Error Occured'
                        });
                    } else if (!file) {
                        res.status(401).json({
                            'code':     401,
                            'message':  'Invalid Credentials'
                        });
                    } else {
                        res.setHeader('Content-Type', file.contentType);

                        var readstream = gfs.createReadStream({
                            "_id": ObjectId(req.query.mediaId)
                        });
                        readstream.pipe(res);
                    };
                });
            });
        },
        write: (req, res) => {
            mongo.MongoClient.connect(__settings.mongodb.url, (err, database) => {
                var gfs = new Grid(database, mongo);

                var metadata = {
                    'appId': req.query.appId,
                    'openiot': {
                        'auth': {
                            'users': [{
                                'role':  5,
                                'email': req.query.email
                            }]
                        }
                    },
                    'serverDate': new Date()
                };

                var writestream = gfs.createWriteStream({
                    'metadata':     metadata,
                    'filename':     req.files.uploads[0].name,
                    'content_type': req.files.uploads[0].type
                });

                fs.createReadStream(req.files.uploads[0].path).pipe(writestream);

                writestream.on('close', (file) => {
                    fs.unlink(req.files.uploads[0].path, () => {
                        res.json({
                            'token':   file.md5,
                            'mediaId': file._id
                        });
                    });
                });
            });
        }
    };
    
    return db;
};

exports.module = module;