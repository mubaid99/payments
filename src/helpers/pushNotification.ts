import admin from 'firebase-admin'
import { ServiceAccount } from 'firebase-admin'

import * as fs from 'fs'
import * as path from 'path'

let isInitialized = false

const initializeFirebase = () => {
	if (!isInitialized) {
		const filePath = path.resolve(__dirname, './../../serviceAccountKey.json')
    
		if (fs.existsSync(filePath)) {
			const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8')) as ServiceAccount
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
			})
			isInitialized = true
		} else {
			throw new Error('serviceAccountKey.json file not found!')
		}
	}
}

export const sendPushNotification = async (tokens, notification, metadata) => {
	if (!isInitialized) {
    
		initializeFirebase()
    
	}
	const message = {
		notification: {
			title: notification.title,
			body: notification.body,
		},
		tokens, // Send to multiple device tokens
		data: metadata,
		android: {
			notification: {
				sound: 'default',
				color: '#ff0000', // Optional: Set a color for Android notifications
			},
		},
		apns: {
			payload: {
				aps: {
					sound: 'default', // iOS sound
				},
			},
		},
	}

	try {
		const response = await admin.messaging().sendEachForMulticast(message)
		Logger.info('Push notification sent successfully.')

		if (response.failureCount > 0) {
			const list = response.responses
			for (let i = 0; i < list.length; i++) {
				if (!list[i].success) {
					await App.Models.FCM.deleteOne({ fcmToken: tokens[i] })
				}
			}
		}
		return response
	} catch (err) {
		Logger.error('Error sending notification:', err)
		return { error: err.message }
	}
}
