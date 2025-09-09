// import '@core/declarations'
// import AWS from 'aws-sdk'

// AWS.config.update({
// 	region: App.Config.AWS.REGION,
// 	accessKeyId: App.Config.AWS.ACCESS_KEY,
// 	secretAccessKey: App.Config.AWS.SECRET_KEY,
// })

// const s3 = new AWS.S3()

// const fileUpload = async (
// 	fileData: Buffer,
// 	folderName: string,
// 	fileName: string,
// 	fileExtension: string,
// 	metadata: any = {}
// ) => {
// 	try {
// 		const filePath = `${folderName}/${fileName}${fileExtension}`
// 		const params = {
// 			Bucket: App.Config.AWS.S3.BUCKET,
// 			Key: filePath,
// 			Body: fileData,
// 			ACL: App.Config.AWS.S3.ACL,
// 			Metadata: metadata,
// 		}

// 		try {
// 			const stored = await s3.upload(params).promise()
// 			return {
// 				isSuccess: true,
// 				data: {
// 					key: stored.Key,
// 					url: stored.Location,
// 				},
// 			}
// 		} catch (error) {
// 			Logger.error(`${error?.message}`)
// 			return { isSuccess: false, data: error }
// 		}
// 	} catch (error) {
// 		Logger.error(`${error?.message}`)
// 		return { isSuccess: false, data: error }
// 	}
// }

// export { fileUpload }
