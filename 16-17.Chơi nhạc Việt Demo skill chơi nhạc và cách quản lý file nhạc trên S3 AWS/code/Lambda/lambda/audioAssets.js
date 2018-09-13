'use strict';
var s3 = require('./s3Controller');
let constants = require('./constants.js');

var getAudioData = async function () {
    audioData =[];
    const rawAudioData = await s3.getListContentFromS3(constants.s3Bucket, constants.s3Prefix);
    
    for (let item of rawAudioData.Contents) {
        if (item.Key && item.Key.endsWith(".mp3")) {
            audioData.push({
                'title': item.Key,
                'url': constants.s3BucketLink + item.Key
            })
        }
    }
    console.log('audioData', audioData);
    return audioData;
}

module.exports = getAudioData;
