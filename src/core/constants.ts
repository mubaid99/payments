export const enum Role {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	USER = 'USER',
}
const constant = {
	// COMMON
	
	DEVELOPMENT: 'development',
	X_POWERED_BY: 'x-powered-by',
	PORT: 5000,
	API_VERSION: '/api/v1',
	MODELS: {
		POOL: 'pools',
		TOKEN: 'tokens',
		TRANSACTION: 'transactions',
		LIQUIDITY: 'liquidity-transaction',
		TOKEN_PRICE: 'Token_Price',
		MARKET_VALUE: 'Market_Value',
		USER: 'users',
		ACTIVITY: 'activities',
		SETTING: 'settings',
		ALERT: 'alerts',
		SUBSCRIBED_ASSETS: 'subscribedAssets',
		FCM: 'fcm',
		POOL_PRICE:'poolprices',
		QR_PAYMENT: 'qrpayments',
		PAYMENT: 'walletpayments'
	},
	COINGECKO: {
		MATIC: 'matic-network',
		ETH: 'ethereum',
		USDC: 'usd-coin'
	},
	LIQUIDITY_TYPE: ['Add', 'Remove'],
	PASSWORD_TOKEN_LENGTH: 64,
	SUBTRACT_DAY_FOR_NEW_PROJECTS: 7,
	MATIC_DECIMALS: 6,
	CURRENCIES: ['matic'],
	TOKEN_DECIMALS: 18,
	ACCOUNT_TYPE: ['USER', 'ADMIN', 'SUPER_ADMIN'],
	USER_TYPES: ['creator', 'investor'],
	CMS: ['privacyPolicy', 'termsCondition', 'aboutUs'],
	LANGUAGE: ['en', 'ja'],
	PLATFORM_NAME: 'Token World',
	PLATFORM_VARIABLE: {
		VALUES: {
			NAME: ['Listing Fee', 'Platform Fee', 'Token Generation Fee'],
			VALUE: ['listing_fee', 'platform_fee', 'token_generation_fee'],
		},
		METADATA: {
			UNIT: ['percentage'],
		},
	},
	PROJECT: {
		PHASES: ['pending', 'rejected', 'in_progress', 'completed', 'failed'],
		BLOCKCHAIN_STATUS: ['pending', 'listed'],
		DURATION_IN_DAYS: [30, 45, 90],
		LOCKUP_PERIOD_IN_MONTHS: [0, 1, 3, 6, 12],
	},
	TRANSACTION: {
		TYPES: [
			'list',
			'buy',
			'token_create',
			'claim_matic',
			'claim_token',
			'withdraw_matic',
			'withdraw_token',
			'project_delete',
			'update_listing_fee',
			'update_platform_fee',
			'update_token_generation_fee',
			'withdraw_platform_balance',
		],
		STATUS: ['pending', 'success', 'failed'],
	},
	RESET_PASSWORD: {
		EXPIRE_IN: 30,
		EXPIRE_IN_UNIT: 'minutes',
	},
	CONFIDENTIAL_VALUES: ['password', 'resetPasswordToken', 'resetPasswordTokenExpiresIn'],
	IMAGE: {
		MIME_TYPES: ['image/jpeg', 'image/png'],
		SIZE_IN_MB: 5,
	},
	PDF: {
		MIME_TYPES: [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		],
		SIZE_IN_MB: 5,
	},
	PDF_IMAGE: {
		MIME_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
		SIZE_IN_MB: 5,
	},
	FILE_TYPES: ['token_symbol', 'token_distribution_plan', 'team_profile', 'road_map', 'other'],
	SORT_VALUE: ['1', '-1'],
	FILTERS: {
		DASHBOARD: {
			CREATOR: {
				PHASES: ['pending_for_approval', 'approved', 'in_progress', 'completed', 'failed'],
			},
			INVESTOR: {
				PHASES: ['invested', 'open', 'completed', 'failed'],
			},
		},
		MARKETPLACE: {
			PHASES: ['open', 'new'],
		},
	},
	BLOCKCHAIN: {
		CONTRACT_TYPES: ['ico', 'token'],
		ICO: {
			EVENT: {
				ERC20_TOKEN_CREATED: 'ERC20TokenCreated',
				PROJECT_LISTED: 'ProjectListed',
				INVESTMENT_MADE: 'InvestmentMade',
				MATIC_CLAIMED: 'MaticClaimed',
				TOKEN_CLAIMED: 'TokenClaimed',
				WITHDRAW_MATIC: 'WithdrawMatic',
				WITHDRAW_TOKEN: 'WithdrawToken',
			},
		},
	},
	DASHBOARD: {
		CREATOR: {
			GET_PROJECTS: {
				SORT_FIELD: {
					KEY: ['createdAt', 'phase'],
					OBJECT: {
						createdAt: 'createdAt',
						phase: 'status.phase',
					},
				},
			},
		},
		INVESTOR: {
			GET_PROJECTS: {
				SORT_FIELD: {
					KEY: ['createdAt', 'phase'],
					OBJECT: {
						createdAt: 'createdAt',
						phase: 'status.phase',
					},
				},
			},
		},
	},
	PROFILE: {
		TOKEN: {
			GET_TOKENS: {
				SORT_FIELD: {
					KEY: ['createdAt'],
					OBJECT: {
						createdAt: 'createdAt',
					},
				},
			},
		},
	},
	MARTKETPLACE: {
		GET_PROJECTS: {
			SORT_FIELD: {
				KEY: ['createdAt', 'phase'],
				OBJECT: {
					createdAt: 'createdAt',
					phase: 'status.phase',
				},
			},
		},
	},
	alert: {
		types: {
			1: 'Price reaches',
			2: 'Price above',
			3: 'Price below',
			4: 'Change is over',
			5: 'Change is under',
			// 6: '24H Change is under',
			// 7: '24H Change is down'
		},
		frequency: {
			1: 'Only once',
			2: 'Once a day',
			3: 'Always'
		},
		limit: 10,
		validity: 90, // in days
		timeBuffer: 5 // in minutes
	},
}

export default constant
