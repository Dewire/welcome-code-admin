import AWS from 'aws-sdk';
import deepMap from 'deep-map';
import { BUCKET_NAME } from '../Constants';

AWS.config.region = 'eu-west-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'eu-west-1:af2fda01-15fa-4d02-9fca-471132b36e6d', // TODO: get from env
});

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

export const getMetaData = (Key) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key,
  };

  return new Promise((resolve, reject) => {
    s3.headObject(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};


export const getImagesFromMuniFolder = (municipality) => {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: `${municipality}/`,
  };

  return new Promise(async (resolve, reject) => {
    s3.listObjectsV2(params, async (err, data) => {
      if (err) {
        reject(err);
      }

      const promises = [];
      const filteredContents = data ? data.Contents.filter(c => c.Key !== `${municipality}/`) : [];
      filteredContents.forEach(c => promises.push(getMetaData(c.Key)));

      Promise.all(promises).then((resps) => {
        const contentsWMetadata = filteredContents;
        resps.forEach((r, i) => {
          const c = filteredContents[i];
          deepMap(r.Metadata, val => (typeof val === 'string' ? decodeURIComponent(val) : val), { inPlace: true });
          contentsWMetadata[i] = { ...c, metaData: r.Metadata };
        });
        resolve({ ...data, Contents: contentsWMetadata });
      });
    });
  });
};
