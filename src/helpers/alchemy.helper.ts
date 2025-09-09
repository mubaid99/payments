// import Web3 from 'web3';
// import { Alchemy, Network } from 'alchemy-sdk'; 

// class AlchemyHelper {
//     private alchemy: Alchemy;
//     private web3: Web3;
//     public apiKey: string;
//     public network: string;

//     constructor(network: string) {
//         // this.apiKey = 'l-Qbdbwte_NpJMY_hIWMAt8h13iFIBZk';
//         // apiKey: App.Config.ALCHEMY.API_KEY,

//         this.apiKey = App.Config.ALCHEMY.API_KEY;
//         this.network = network;
//         const networkUrl = `https://polygon-amoy.g.alchemy.com/v2/${this.apiKey}`;

//         this.web3 = new Web3(new Web3.providers.HttpProvider(networkUrl));
//         this.alchemy = new Alchemy({
//             apiKey: this.apiKey,
//             network: Network.MATIC_AMOY,
//         });
//     }

//     async getTransactionReceipt(transactionHash: string) {
//         if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
//             console.error('Invalid transaction hash format');
//             return {
//                 isSuccess: false,
//                 message: 'Invalid transaction hash format',
//             };
//         }
//         try {
//             console.info(`Fetching transaction receipt for hash: ${transactionHash}`);
//             const receipt = await this.alchemy.core.getTransactionReceipt(transactionHash);
//             console.log(receipt, 'receipt ');
//             if (!receipt) {
//                 throw new Error('Transaction receipt not found');
//             }
//             console.info(`Transaction receipt fetched: ${JSON.stringify(receipt)}`);
//             return {
//                 isSuccess: true,
//                 data: receipt,
//             };
//         } catch (error) {
//             console.error(`Failed to get transaction receipt: ${error.message}`);
//             return {
//                 isSuccess: false,
//                 message: `Failed to get transaction receipt: ${error.message}`,
//             };
//         }
//     }

//     // Method to get pair address from logs
//     async getPair(transactionHash: string) {
//         try {
//             const { isSuccess, data: receipt } = await this.getTransactionReceipt(transactionHash);
//             if (!isSuccess || !receipt) {
//                 throw new Error('Failed to get transaction receipt');
//             }
//             // Extract the correct log for PairCreated event
//             const pairLog = receipt.logs.find(log => 
//                 log.topics[0] === '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'
//             );
            
//             if (!pairLog) {
//                 throw new Error('PairCreated event log not found');
//             }

//             // Extract the pair address and format it correctly
//             const rawPairAddress = pairLog.data.slice(0, 66); // First 66 characters contain the address
//             const pairContractAddress = `0x${rawPairAddress.slice(-40)}`; // Trim leading zeros

//             console.log(`Pair address found: ${pairContractAddress}`);
//             return {
//                 isSuccess: true,
//                 data: pairContractAddress,
//             };
//         } catch (error) {
//             console.error(`Failed to get pair contract from transaction: ${error.message}`);
//             return {
//                 isSuccess: false,
//                 message: `Failed to get pair contract from transaction: ${error.message}`,
//             }
//         }
//     }
// }

// export default AlchemyHelper
