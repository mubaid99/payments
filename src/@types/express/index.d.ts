declare namespace Express {
	export interface Response {
		[key: string]: any // eslint-disable-line
		unprocessableEntity: CallableFunction
		success: CallableFunction
		badRequest: CallableFunction
		notFound: CallableFunction
		internalServerError: CallableFunction
		unauthorized: CallableFunction
		created: CallableFunction
	}
	export interface Request {
		user: any
		project: any
		projectList: any
	}
}
