const AWS = require('aws-sdk');
const util = require('util');
const fs = require('fs');

const dstBucket = 'sync-file-test';

function upload(file, fileName) {
    console.log('file:\n', util.inspect(file, {
        depth: 5
    }));
    const tokyoS3Params = {
        Body: file, 
        Bucket: dstBucket,
        Key: fileName
    };
    const tokyoS3 = new AWS.S3({
        apiVersion: '2006-03-01',
        region: 'ap-northeast-1',
        accessKeyId: '' ,
        secretAccessKey: ''
    });
    tokyoS3.putObject(tokyoS3Params, function (err, data) {
        if (err ) {
            console.log('err');
            console.log(err);
            
        }
        else {
            console.log('success');
            console.log(data);
            
        }
    });
}

function uploadDir() {
    let file1 = fs.readFileSync('./pic/pic1.jpg', 'utf8');
    upload(file1, 'pic/pic1.jpg');
    let file2 = fs.readFileSync('./pic/pic2.jpg', 'utf8');
    upload(file2, 'pic/file2.jpg');
    let file3 = fs.readFileSync('./pic/pic3.jpg', 'utf8');
    upload(file3, 'pic/file3.jpg');
    let file4 = fs.readFileSync('./pic/pic4.jpg', 'utf8');
    upload(file4, 'pic/file4.jpg');
    let file5 = fs.readFileSync('./pic/pic5.jpg', 'utf8');
    upload(file5, 'pic/file5.jpg');
    let file6 = fs.readFileSync('./pic/pic6.jpg', 'utf8');
    upload(file6, 'pic/file6.jpg');
    let file7 = fs.readFileSync('./pic/pic7.jpg', 'utf8');
    upload(file7, 'pic/file7.jpg');
}

uploadDir();