import { Request, Response } from 'express'
import requestValidator from '@helpers/request-validator.helper'
import QRCode from 'qrcode'
import { createQRPaymentValidator } from '../dto'

// Basic regex validators
const isEvmAddress = (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a)
const isTronAddress = (a: string) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a)

export const createQRPayment = async (req: Request, res: Response) => {
  try {
    // ✅ Validate request body against DTO
    const error = requestValidator(createQRPaymentValidator, req.body)
    if (error) return (res as any).badRequest({ err: error })

    const { blockchain, coinName, clientId, amount, toAddress, contract } = req.body

    // ✅ Validate addresses based on blockchain
    if (blockchain === 'ethereum' || blockchain === 'bsc'  || blockchain === 'sepolia' ||  blockchain === 'polygon') {
      if (!isEvmAddress(toAddress)) return (res as any).badRequest({ err: 'Invalid EVM address' })
      if (contract && !isEvmAddress(contract)) return (res as any).badRequest({ err: 'Invalid ERC20 contract address' })
    } else if (blockchain === 'tron') {
      if (!isTronAddress(toAddress)) return (res as any).badRequest({ err: 'Invalid TRON address' })
      if (contract && !isTronAddress(contract)) return (res as any).badRequest({ err: 'Invalid TRC20 contract address' })
    } else {
      return (res as any).badRequest({ err: 'Unsupported blockchain' })
    }

    // ✅ Save to DB
    const paymentData = { blockchain, coinName, clientId, amount, toAddress, contract }
    const qrPayment = await App.Models.QRPaymentModel.create(paymentData)

    // ✅ Build URI (MetaMask, Trust Wallet, TronLink compatible)
    let uri = `${blockchain}:${toAddress}`

    if(qrPayment && qrPayment._id){
      uri += `?orderId=${qrPayment?._id}`
    }
    // If token transfer
    if (contract) {
      uri += `&token=${contract}`
    }

    // If amount
    if (amount) {
      uri += contract ? `&amount=${amount}` : `?amount=${amount}`
    }

    // ✅ Generate QR code (base64)
    const qrImageBase64 = await QRCode.toDataURL(uri, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 512,
    })

    return (res as any).success({
      data: {
        qrImage: qrImageBase64,
        qrURI: uri,
        orderId: qrPayment._id,
        comment: qrPayment._id,
        amount: qrPayment.amount || null,
        blockchain: qrPayment.blockchain,
        coinName: qrPayment.coinName,
        clientId: qrPayment.clientId,
        toAddress: qrPayment.toAddress,
        contract: qrPayment.contract || null,
      },
      message: 'QR Payment created successfully',
    })
  } catch (err: any) {
    Logger.error(err.message)
    return (res as any).internalServerError({ err: err.message })
  }
}
