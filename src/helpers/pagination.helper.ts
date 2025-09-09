import '@core/declarations'
import { Document, Model } from 'mongoose'

interface PaginationOptions {
	startIndex: any
	itemsPerPage: any
	populate?: any
	query?: Record<string, any>
	sort?: any
	projection: any
}

interface PaginationResult<T> {
	totalItems: number
	startIndex: number
	itemsPerPage: number
	totalPage: number
	data: T[]
}

class PaginationHelper<T extends Document> {
	private model: Model<T>
	constructor(model: Model<T>) {
		this.model = model
	}
	async paginate(inputs: PaginationOptions): Promise<PaginationResult<T>> {
		try {
			const {
				populate = null,
				startIndex = 1,
				itemsPerPage = +App.Config.ITEMS_PER_PAGE,
				query = {},
				sort = { _id: -1 },
				projection = {},
			} = inputs
			const perPage = itemsPerPage > 0 ? itemsPerPage : +App.Config.ITEMS_PER_PAGE
			const skipCount: number = startIndex > 0 ? (startIndex - 1) * perPage : 0
			const totalItems = await this.model.countDocuments(query)
			let data = []
			if (populate) {
				data = await this.model
					.find(query, projection)
					.sort(sort)
					.skip(skipCount)
					.limit(perPage)
					.populate(populate)
					.lean()
			} else {
				data = await this.model
					.find(query, projection)
					.sort(sort)
					.skip(skipCount)
					.limit(perPage)
					.lean()
			}

			return {
				totalItems,
				startIndex: +startIndex || 1,
				itemsPerPage: perPage,
				totalPage: Math.ceil(totalItems / perPage),
				data,
			}
		} catch (error) {
			Logger.error(error)
		}
		// On Error Return Null
		return null
	}
}

// All Done
export default PaginationHelper
