// import Stripe from 'stripe'

// class StripeHelper {
// 	stripe: Stripe
// 	constructor() {
// 		this.stripe = new Stripe(App.Config.STRIPE.SECRET_KEY, App.Config.STRIPE.API_VERSION)
// 	}

// 	public async createAccount(params: Stripe.AccountCreateParams) {
// 		try {
// 			const account: Stripe.Account = await this.stripe.accounts.create(params)
// 			return account
// 		} catch (err) {
// 			Logger.error(
// 				`${App.Message.Helper.Stripe.createAccount.Error.AccountNotCreated()}\n${
// 					err?.message
// 				}`
// 			)
// 		}
// 	}

// 	public async createAccountLink(params: Stripe.AccountLinkCreateParams) {
// 		try {
// 			const accountLink: Stripe.AccountLink = await this.stripe.accountLinks.create(params)
// 			return accountLink
// 		} catch (err) {
// 			Logger.error(
// 				`${App.Message.Helper.Stripe.createAccount.Error.AccountLinkNotCreated()}\n${
// 					err?.message
// 				}`
// 			)
// 		}
// 	}

// 	public async retrieveAccount(params: Stripe.AccountRetrieveParams) {
// 		try {
// 			const account: Stripe.Account = await this.stripe.accounts.retrieve(params)
// 			return account
// 		} catch (err) {
// 			Logger.error(
// 				`${App.Message.Helper.Stripe.createAccount.Error.AccountNotRetrieved()}\n${
// 					err?.message
// 				}`
// 			)
// 		}
// 	}

// 	public async retrieveBalance(accountId: string) {
// 		try {
// 			const balance: Stripe.Balance = await this.stripe.balance.retrieve(
// 				{},
// 				{
// 					stripeAccount: accountId,
// 				}
// 			)
// 			return balance
// 		} catch (err) {
// 			Logger.error(
// 				`${App.Message.Helper.Stripe.createAccount.Error.BalanceNotRetrieved()}\n${
// 					err?.message
// 				}`
// 			)
// 		}
// 	}

// 	public async createCustomer(params: Stripe.CustomerCreateParams) {
// 		try {
// 			const customer: Stripe.Customer = await this.stripe.customers.create(params)
// 			return customer
// 		} catch (err) {
// 			Logger.error(
// 				`${App.Message.Helper.Stripe.createAccount.Error.CustomerNotCreated()}\n${
// 					err?.message
// 				}`
// 			)
// 		}
// 	}

// 	public async createPaymentIntent(params: Stripe.PaymentIntentCreateParams) {
// 		try {
// 			const paymentIntent: Stripe.PaymentIntent = await this.stripe.paymentIntents.create(
// 				params
// 			)
// 			return paymentIntent
// 		} catch (err) {
// 			Logger.error(
// 				`${App.Message.Helper.Stripe.createAccount.Error.PaymentIntentNotCreated()}\n${
// 					err?.message
// 				}`
// 			)
// 		}
// 	}

// 	public async paymentIntentList(params: Stripe.PaymentIntentListParams) {
// 		try {
// 			const paymentIntentList = await this.stripe.paymentIntents.list(params)
// 			return paymentIntentList
// 		} catch (err) {
// 			Logger.error(
// 				`${App.Message.Helper.Stripe.createAccount.Error.PaymentIntentListNotFetched()}\n${
// 					err?.message
// 				}`
// 			)
// 		}
// 	}

// 	public async getBalanceTransactions(
// 		params: Stripe.BalanceTransactionListParams,
// 		accountId: string
// 	) {
// 		try {
// 			const balanceTransaction = await this.stripe.balanceTransactions.list(params, {
// 				stripeAccount: accountId,
// 			})
// 			return balanceTransaction
// 		} catch (err) {
// 			Logger.error(
// 				`${App.Message.Helper.Stripe.createAccount.Error.BalanceTransactionNotFetched()}\n${
// 					err?.message
// 				}` ////////
// 			)
// 		}
// 	}

// 	public async createSetupIntent(params: Stripe.SetupIntentCreateParams) {
// 		try {
// 			const setupIntent: Stripe.SetupIntent = await this.stripe.setupIntents.create(params)
// 			return setupIntent
// 		} catch (err) {
// 			Logger.error(
// 				`${App.Message.Helper.Stripe.createAccount.Error.SetupIntentNotCreated()}\n${
// 					err?.message
// 				}`
// 			)
// 		}
// 	}
// }

// export default new StripeHelper()
