import '@core/declarations'
import { Request, Response } from 'express'
import swapService from '../services'
import { MetaRequestDto } from '../dto'

/**
 * @route GET /api/v1/swap/meta
 * @desc Get supported blockchains, tokens, and swappers
 * @access Public
 */
export const getMeta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey } = req.query

    const request: MetaRequestDto = {
      apiKey: apiKey as string
    }

    const result = await swapService.getMeta(request)

    if (result.success) {
      ;(res as any).success({
        blockchains: result.blockchains,
        tokens: result.tokens,
        swappers: result.swappers,
        message: 'Swap metadata retrieved successfully'
      })
    } else {
      ;(res as any).badRequest({
        error: result.error,
        message: 'Failed to retrieve swap metadata'
      })
    }
  } catch (error) {
    Logger.error('Error in getMeta controller:', error)
    ;(res as any).internalServerError({
      error: 'Internal server error while fetching swap metadata'
    })
  }
}