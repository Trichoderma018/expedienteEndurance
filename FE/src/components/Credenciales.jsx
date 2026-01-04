import AWS from 'aws-sdk';

//Aqui van las credenciales



const uploadImageToS3 = async (file) => {
    const params = {
      Bucket: S3_BUCKET,
      Key: file.name,
      Body: file,
      ContentType: file.type,
    }; 
    return s3.upload(params).promise();
}


export default uploadImageToS3