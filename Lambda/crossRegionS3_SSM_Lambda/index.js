const async = require('async');
const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

exports.handler = (event, context, callback) => {
    
    const tokyoS3Bucket = event.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const dstBucket = tokyoS3Bucket;
    console.log('Sync S3 from Tokyo to China :\n S3 Bucket: ' +  tokyoS3Bucket + ', \n Sync file: ' + Key);
    async.waterfall([
        function download(next) {
            const tokyoS3 = new AWS.S3({
                apiVersion: '2006-03-01', 
                region: 'ap-northeast-1'
            });
            const tokyoS3Params = {
                Bucket: tokyoS3Bucket,
                Key
            };
            tokyoS3.getObject(tokyoS3Params, function(err, file) {
                if (err) {
                    next(err);
                }
                else {
                    next(null, file);
                }
            });
        },
        function getS3Key(file, next) {
            let s3Config = {};
            
            const ssmParams = {
                Names: [
                    'CHINA-S3-ACCESS-KEY-ID',
                    'CHINA-S3-SECRET-ACCESS-KEY'
                ],
                WithDecryption: false
            };
              
            ssm.getParameters(ssmParams, function(err, keyPair) {
                if (err) {
                    next(err);
                }
                keyPair.Parameters.filter(key => {
                    if (key.Name === 'CHINA-S3-ACCESS-KEY-ID') {
                        s3Config.accessKeyId = key;
                    }
                    if (key.Name === 'CHINA-S3-SECRET-ACCESS-KEY') {
                        s3Config.secretAccessKey = key;
                    }
                });
                if (s3Config.accessKeyId && s3Config.secretAccessKey) {
                    next(null, file, s3Config);
                }	
                else {
                    next('get s3 keyPair error');
                }
            });
        },
        function upload(file, s3Config, next) {
            const dstS3 = new AWS.S3({
                apiVersion: '2006-03-01',
                region: 'cn-north-1', //'ap-southeast-1',
                accessKeyId: s3Config.accessKeyId.Value,
                secretAccessKey: s3Config.secretAccessKey.Value
            });
            
            const dstS3Params = {
                Body: Buffer.from(file.Body, 'UTF-8'), 
                Bucket: 'sync-file-test', //dstBucket,
                Key
            };
            
            dstS3.upload(dstS3Params, function(err) {
                if (err) {
                    next(err);
                }
                else {
                    next(null);
                }
            });
        }
    ], function (err) {
        if (err) {
            console.log('Sync S3 error');
            callback(err);
        }
        else {
          console.log('Sync file to another bucket success.');
          callback(null, 'success');
        }
    });
};
