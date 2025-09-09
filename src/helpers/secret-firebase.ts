import fs from 'fs'
import AWS from 'aws-sdk'

// Configure AWS Secrets Manager
const secretsManager = new AWS.SecretsManager({
    region: 'me-central-1',
    accessKeyId: App.Config.AWS.ACCESS_KEY,
    secretAccessKey: App.Config.AWS.SECRET_KEY
});

// Function to get a secret and store it in a file
async function getAndStoreSecret(secretName, filePath) {
    try {
        const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
        
        if (data.SecretString) {
            fs.writeFileSync(filePath, data.SecretString, 'utf8');
            console.log(`Secret saved to ${filePath}`);
        } else {
            console.error('Secret does not have a string value.');
        }
    } catch (err) {
        
        console.error(`Error retrieving secret: ${err.message}`);
    }
}

export default getAndStoreSecret
