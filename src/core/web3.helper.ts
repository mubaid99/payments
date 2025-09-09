// /* eslint-disable prefer-const */
// /* eslint-disable no-useless-catch */
// import { createPublicClient, http } from 'viem'
// import { formatUnits } from 'ethers'
// import { polygonAmoy } from 'viem/chains'
// import * as dotenv from 'dotenv'


// dotenv.config()

// class LiquidityContract {
// 	private client: any
// 	private contractAddress: `0x${string}`
// 	private abi: any
// 	private tokenABI: any
// 	private poolABI: any
// 	private routerABI: any
// 	constructor() {
// 		// Initialize the public client
// 		this.client = createPublicClient({
// 			chain: polygonAmoy,
// 			transport: http(),
// 		})

// 		// Load contract address and ABI
// 		this.contractAddress = process.env.LIQUIDITY_CONTRACT_ADDRESS as `0x${string}`
// 		this.abi = SolulabLiquidityTokenAbi
// 		this.tokenABI = TokenAbi
// 		this.poolABI = PoolAbi
// 		this.routerABI = RouterAbi
// 	}
// 	private getZero = (decimal) => {
// 		return ''?.padEnd(decimal, '0')
// 	}

// 	private convertToDecimal = (value = '', decimal) => {
// 		const strValue = value?.toString()
// 		if (strValue?.includes('.')) {
// 			const strarr = strValue.split('.')
// 			let resStr = `${strarr[0]}${strarr[1]}${this.getZero(+decimal - +strarr[1].length)}`
// 			return resStr
// 		} else {
// 			let resStr = `${value}${this.getZero(+decimal)}`
// 			return resStr
// 		}
// 	}
// 	// Method to call getAmountsOut
// 	async getAmountsOut(tkn1Address: string, tkn2Address: string, amount: string, decimal: number) {
// 		try {
// 			const result = await this.client.readContract({
// 				abi: this.routerABI,
// 				address: this.contractAddress,
// 				functionName: 'getAmountsOut',
// 				args: [
// 					this.convertToDecimal(amount, decimal).toString(),
// 					[tkn2Address, tkn1Address],
// 				],
// 			})
// 			const rate2 = formatUnits(result[1], decimal)
// 			return rate2
// 		} catch (error) {
// 			// console.log(error)
// 			return null
// 		}
// 	}

// 	// Example of another method: getReserves
// 	async getReserves(contractAddress: string) {
// 		try {
// 			const result = await this.client.readContract({
// 				abi: this.poolABI,
// 				address: contractAddress,
// 				functionName: 'getReserves',
// 			})
// 			return result
// 		} catch (error) {
// 			// console.error('Error calling getReserves:', error)
// 			return [0, 0]
// 		}
// 	}

// 	async getPoolBalance(pairContractAddress: string, walletAddress: string) {
// 		try {
// 			const result = await this.client.readContract({
// 				abi: this.tokenABI,
// 				address: pairContractAddress,
// 				functionName: 'balanceOf',
// 				args: [walletAddress],
// 			})
// 			const rate2 = formatUnits(result, 18)
// 			return rate2
// 		} catch (error) {
// 			console.log(error)
// 			return null
// 		}
// 	}
// 	async getTotalSupply(tokenContractAddress: string) {
// 		try {
// 			const result = await this.client.readContract({
// 				abi: this.tokenABI,
// 				address: tokenContractAddress,
// 				functionName: 'totalSupply',
// 			})
// 			const rate2 = formatUnits(result, 18)
// 			return rate2
// 		} catch (error) {
// 			// console.log("Error:::::", error)
// 			return null
// 		}
// 	}

// 	async getTokenBalance(address: string, tokenContractAddress: string) {
// 		try {
// 			// Validate inputs
// 			console.log({address,tokenContractAddress})
// 			if (!address || !tokenContractAddress) {
// 				console.log('Invalid address or token contract address')
// 				return "0"
// 			}
	
// 			// Validate address format
// 			if (!tokenContractAddress.startsWith('0x') || tokenContractAddress.length !== 42) {
// 				console.log(`Invalid token contract address format: ${tokenContractAddress}`)
// 				return "0"
// 			}
	
// 			if (!address.startsWith('0x') || address.length !== 42) {
// 				console.log(`Invalid wallet address format: ${address}`)
// 				return "0"
// 			}
	
// 			// First, try to verify if the contract exists by checking if it has code
// 			// const code = await this.client.getBytecode({
// 			// 	address: tokenContractAddress as `0x${string}`
// 			// })
	
// 			// if (!code || code === '0x') {
// 			// 	console.log(`No contract found at address: ${tokenContractAddress}`)
// 			// 	return "0"
// 			// }
	
// 			// Try to get the token decimals first to verify it's a valid ERC20 token
// 			let decimals = 18 // default
// 			try {
// 				decimals = await this.client.readContract({
// 					abi: this.tokenABI,
// 					address: tokenContractAddress as `0x${string}`,
// 					functionName: 'decimals',
// 				})
// 			} catch (decimalError) {
// 				console.log(`Could not get decimals for token ${tokenContractAddress}, using default 18`)
// 			}
	
// 			const balance = await this.client.readContract({
// 				abi: this.tokenABI,
// 				address: tokenContractAddress as `0x${string}`,
// 				functionName: 'balanceOf',
// 				args: [address as `0x${string}`],
// 			})
			
// 			const rate2 = formatUnits(balance, decimals)
// 			return rate2 || "0"
// 		} catch (error) {
// 			console.log(`Error getting token balance for ${address} on contract ${tokenContractAddress}:`, error.message)
// 			return "0"
// 		}
// 	}
	
// }

// // Export an instance of the class
// export const liquidityContract = new LiquidityContract()
