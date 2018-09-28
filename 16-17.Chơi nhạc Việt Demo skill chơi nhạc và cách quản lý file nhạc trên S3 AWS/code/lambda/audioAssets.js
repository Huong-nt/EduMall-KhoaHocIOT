'use strict';
var s3 = require('./s3Controller');
const constants = require('./constants');

var getAudioData = async function () {
    var audioData =[];
    const rawAudioData = await s3.getListContentFromS3(constants.skill.s3Bucket, constants.skill.s3Prefix);
    
    for (let item of rawAudioData.Contents) {
        if (item.Key && item.Key.endsWith(".mp3")) {
            var title = item.Key.replace(/us-uk\/|.mp3/gi, '')
            var key = item.Key.replace(/ /gi, '+')
            audioData.push({
                'title': title,
                'url': constants.skill.s3BucketLink + key
            })
        }
    }
    console.log('audioData', audioData);
    return audioData;
}

module.exports = getAudioData;
