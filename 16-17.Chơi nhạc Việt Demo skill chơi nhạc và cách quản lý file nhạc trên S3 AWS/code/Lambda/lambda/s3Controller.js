'use strict';
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
let constants = require('./constants.js');

function getListContentFromS3(bucket, prefix) {
    return new Promise((resolve, reject) => {
        var params = {
            Bucket: bucket,
            Prefix: prefix
        };
        var s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        s3.listObjects(params, function (err, data) {
            if (err) {
                // console.log("Error", err);
                reject(err);
            } else {
                // console.log("Success", data);
                resolve(data);
            }
        });
    });
}

// function getObjectTagging(bucket, key) {
//     return new Promise((resolve, reject) => {
//         var params = {
//             Bucket: bucket,
//             Key: key
//         };
//         var s3 = new AWS.S3({ apiVersion: '2006-03-01' });
//         s3.getObjectTagging(params, function (err, data) {
//             if (err) {
//                 console.log("Error", err);
//                 reject(err);
//             } else {
//                 console.log("Success", data);
//                 resolve(data);
//             }
//         });
//     });
// }

module.exports = { getListContentFromS3 }