const AWS = require('aws-sdk');
const util = require('util');

const Bucket = 'sync-file-test';
let buffer = null;
let Key = '';
function upload(file, fileName) {
    console.log('file:\n', util.inspect(file, {
        depth: 5
    }));
    const tokyoS3Params = {
        Body: file, 
        Bucket: Bucket,
        Key: 'a' + fileName
    };
    AWS.config.update({
        region: 'ap-northeast-1',
        accessKeyId: '' ,
        secretAccessKey: ''
    });
    
    const config = new AWS.Config({
        accessKeyId: '', 
        secretAccessKey: '', 
        region: 'ap-northeast-1'
    });
    // AWS.config = config;
    console.log(AWS);
    
    const tokyoS3 = new AWS.S3({
        apiVersion: '2006-03-01',
        region: 'ap-northeast-1'
        
    });
    tokyoS3.putObject(tokyoS3Params, function (err, data) {
        if (err ) {
            console.log('err');
            throw new Error(err);
            
        }
        else {
            console.log('upload success');
            console.log(data);
            
        }
    });
}

function download(callback) {
    console.log('download file');
    const chinaS3 = new AWS.S3({
        apiVersion: '2006-03-01', 
        region: 'cn-north-1',
    });
    const chinaS3Params = {
        Bucket: Bucket
    };
    chinaS3.listObjects(chinaS3Params, function (err, data) {
        if (err) {
            console.log('chinaS3.listObjects err');
            throw new Error(err);
        }
       
        data.Contents.forEach(Obj => {
            console.log('Obj:\n', util.inspect(Obj, {
                depth: 5
            }));
            chinaS3Params.Key = Obj.Key
            chinaS3.getObject(chinaS3Params, function (err, file) {
                if (err) {
                    console.log('chinaS3.getObject err');
                    throw new Error(err);
                }
                buffer = file.Body;
                Key = Obj.Key;
                console.log('download file success');
                callback(null);
            })
        });
    });
}

download(() => {

    upload(buffer, Key);
});