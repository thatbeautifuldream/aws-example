const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
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
} = require("./data-prod.js");

// Constants
const DURATION = 1000 * 60 * 60 * 24 * 365 * 100; // 100 years in milliseconds

/**
 * S3 client instance
 * @type {S3Client}
 */
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload paths for different file types
 * @type {Object.<string, {path: string}>}
 */
const TYPE_UPLOAD = {
  screen_recording: { path: AWS_SCREEN_RECORDINGS_PATH },
  camera_recording: { path: AWS_CAMERA_RECORDINGS_PATH },
  document: { path: AWS_DOCUMENTS_PATH },
};

/**
 * Uploads a file to S3
 * @param {Object} params - Upload parameters
 * @param {string} params.bucket - S3 bucket name
 * @param {string} params.objectKey - S3 object key
 * @param {Buffer|Uint8Array|Blob|string|Readable} params.body - File content
 * @param {string} params.contentType - File content type
 * @returns {Promise<void>}
 * @throws {Error} If upload fails
 */
async function uploadFile({ bucket, objectKey, body, contentType }) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    });
    await s3.send(command);
    console.log(`File uploaded successfully: ${objectKey}`);
  } catch (error) {
    throw new Error(`Could not upload file to S3: ${error.message}`);
  }
}

/**
 * Generates a signed URL for CloudFront
 * @param {string} objectKey - The object key in S3
 * @returns {string} Signed URL
 */
function generateSignedUrl(objectKey) {
  return getSignedUrl({
    url: `${CLOUDFRONT_DISTRIBUTION_URL}/${objectKey}`,
    keyPairId: CLOUDFRONT_KEY_PAIR_ID,
    dateLessThan: new Date(Date.now() + DURATION).toISOString(),
    privateKey: CLOUDFRONT_PRIVATE_KEY,
  });
}

// Example usage
(async () => {
  try {
    // Example: Upload a file
    // await uploadFile({
    //   bucket: AWS_ROOT_BUCKET_NAME,
    //   objectKey: `${TYPE_UPLOAD.document.path}/example.pdf`,
    //   body: fs.createReadStream('./example.pdf'),
    //   contentType: "application/pdf",
    // });

    // Example: Generate a signed URL
    const signedUrl = generateSignedUrl(
      "assets/videos/proctoring-instructions-v2.mp4"
    );
    console.log("Signed URL:", signedUrl);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();

// Export functions for use in other modules
module.exports = {
  uploadFile,
  generateSignedUrl,
};
