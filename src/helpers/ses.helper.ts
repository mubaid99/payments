// import '@core/declarations'
// import AWS from 'aws-sdk'

// AWS.config.update({
// 	region: App.Config.AWS.REGION,
// 	accessKeyId: App.Config.AWS.ACCESS_KEY,
// 	secretAccessKey: App.Config.AWS.SECRET_KEY,
// })

// const ses = new AWS.SES({ apiVersion: App.Config.AWS.SES.API_VERSION })

// const sendMail = async (
// 	to: string,
// 	subject: string,
// 	templateName: string,
// 	data: any,
// 	language: any
// ) => {
// 	try {
// 		const templatePath = `../templates/${language}/${templateName}`
// 		const { returnTemplate } = await import(templatePath)
// 		const passedHtml = returnTemplate(data)
// 		try {
// 			const params = {
// 				Destination: {
// 					ToAddresses: [to],
// 				},
// 				Message: {
// 					Body: {
// 						Html: {
// 							Data: passedHtml,
// 						},
// 					},
// 					Subject: {
// 						Data: subject,
// 					},
// 				},
// 				Source: App.Config.AWS.SES.SENDER_EMAIL,
// 			}
// 			const sendEmail = ses.sendEmail(params).promise()
// 			sendEmail
// 				.then((data) => {
// 					return {
// 						isSuccess: true,
// 						data,
// 					}
// 				})
// 				.catch((error) => {
// 					Logger.error(`${error?.message}`)
// 					return {
// 						isSuccess: true,
// 						message: error?.message,
// 					}
// 				})
// 		} catch (error) {
// 			Logger.error(`${error?.message}`)
// 			return { isSuccess: false, data: error }
// 		}
// 	} catch (error) {
// 		Logger.error(`${error?.message}`)
// 		return { isSuccess: false, data: error }
// 	}
// }

// export { sendMail }
