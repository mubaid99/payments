/*eslint-disable */

declare let App: {
	Config: any
	Message: any
	Models: {
		Pool: any
		Token: any
		Transaction: any
	    Liquidity: any
		TokenPrice: any
		MarketValue: any
		User: any
		Setting: any
		Activity:any
		ALERT:any
		SUBSCRIBED_ASSETS:any
		FCM:any,
		POOL_PRICE:any
		WalletBalance:any
		Balance:any
		UsdTokenModel: any
		QRPaymentModel:any
		WalletPaymentModel:any
	}
	Notification: {
		User: {
			Dashboard: any
			Profile: any
			Project: any
			Stripe: any
			Token: any
		}
		Admin: {
			UserManagement: any
			ProjectManagement: any
			PlatformVariable: any
			UpdateDetails: any
		}
		Investor: {
			Project: any
		}
	}
}
declare let Logger: {
	info: CallableFunction
	warn: CallableFunction
	error: CallableFunction
}

/*eslint-enable */
