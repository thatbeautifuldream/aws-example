const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const { uuid } = require('uuidv4');
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const {
    AWS_DOCUMENTS_PATH,
    AWS_SCREEN_RECORDINGS_PATH,
    AWS_CAMERA_RECORDINGS_PATH,
    AWS_ROOT_BUCKET_NAME,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    CLOUDFRONT_PRIVATE_KEY,
    CLOUDFRONT_KEY_PAIR_ID,
    CLOUDFRONT_DISTRIBUTION_URL,
} = require('./data-prod.js');

// const privateKey: any = process.env.CLOUDFRONT_KEY ? process.env.CLOUDFRONT_KEY.replace(/\\n/g, '\n') : null;
// const publicKey: any = process.env.PUBLIC_KEY;

// let cloudFront: any;

// // TODO: Need to remove this and use Access key and Secret key
// if (privateKey && publicKey) {
//   cloudFront = new AWS.CloudFront.Signer(publicKey, privateKey);
// }



const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const type_upload  = {
  screen_recording: {
    path: AWS_SCREEN_RECORDINGS_PATH,
  },
  camera_recording: {
    path: AWS_CAMERA_RECORDINGS_PATH,
  },
  document: {
    path: AWS_DOCUMENTS_PATH,
  },
};


const uploadFile = async ({
  bucket,
  objectKey,
  body,
  contentType,
}) => {
  try {
    const params = {
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    };
    const command = new PutObjectCommand(params);
    const data = await s3.send(command);
    console.log(data)
    // const data = await s3.putObject(params).promise();
    // return data;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Could not retrieve file from S3: ${e.message}`);
    }
    throw new Error(e.message);
  }
};

// uploadFile({
//     bucket: AWS_ROOT_BUCKET_NAME,
//     objectKey: `${type_upload.document.path}/data.pdf`,
//     body: fs.createReadStream(`${__dirname}/data.pdf`),
//     contentType: "application/pdf",
// });

const signedUrl = getSignedUrl({
    url: `${CLOUDFRONT_DISTRIBUTION_URL}/assets/videos/procturing-instructions.mp4`,
    keyPairId: CLOUDFRONT_KEY_PAIR_ID,
    dateLessThan: new Date( Date.now() + (1000 * 60 * 60 * 60 *24*30*12*100) ).toString(),
    privateKey: CLOUDFRONT_PRIVATE_KEY,
  });

console.log(signedUrl);