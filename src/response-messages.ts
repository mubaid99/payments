export default {
	Success: {
		Success: `Success.`,
		Created: `Created.`,
		DatabaseConnected: 'Database Connected Successfully.',
		ServerStartUp: `App is running at http://localhost:<%-port%> in <%-mode%>.`,
		StopServerMessage: `Press CTRL-C to stop.`,
	},
	Error: {
		NotFound: `Not found.`,
		BadRequest: `Bad Request.`,
		Unauthorized: `Un-authorized access.`,
		InternalServerError: `Server error`,
		UnprocessableEntity: `Unprocessable Entity.`,
		UrlNotFound: `Route '<%-url%>' not found on this server.`,
		DatabaseConnectionFailed: 'Database Connection Failed.',
		MissingEnvFile: `Missing environment file for NODE_ENV=<%-environment%>`,
	},

	// API
	Admin: {
		Platform: {
			CreatePlatform: {
				Success: {
					PlatformCreated: `Platform created successfully.`,
				},
				Error: {},
			},
			GetPlatform: {
				Success: {},
				Error: {
					PlatformNotFound: `Platform not found.`,
				},
			},
			DeletePlatform: {
				Success: {
					PlatformDeleted: `Platform deleted successfully.`,
				},
				Error: {
					PlatformNotFound: `Platform not found.`,
					UserPoolCanNotBeDeleted: `User pool could not be deleted.`,
				},
			},
		},
	},
	Auth: {
		SignIn: {
			Success: {},
			Error: {
				UserNotFound: 'User not found.',
				InvalidAccessToken: 'Invalid access token.',
			},
		},
	},
	Profile: {
		GetUser: {
			Success: {},
			Error: {
				UserNotFound: 'User not found.',
			},
		},
		UploadFiles: {
			Success: {
				FileUploaded: 'File uploaded successfully.',
			},
			Error: {
				ProvideFile: 'Please provide file.',
				FileNotUploaded: 'File could not be uploaded.',
			},
		},
		SubmitKyc: {
			Success: {
				KycSubmitted: 'KYC submitted successfully.',
			},
			Error: {
				UserNotFound: 'User not found.',
				KycAlreadySubmitted: 'KYC already submitted.',
			},
		},
		ChangePassword: {
			Success: {},
			Error: {
				UserNotFound: 'User not found.',
			},
		},
	},
	Portfolio: {
		GetPortfolio: {
			Success: {},
			Error: {
				WalletNotFound: 'Wallet not found.',
			},
		},
	},
}
