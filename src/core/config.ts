import '@core/declarations'
import { FileExistsSync } from './utils'
import { Logger } from './logger'

export interface ConfigInterface {
        PORT: number
        ENVIRONMENT: string
        DB_CONNECTION_STRING: string
        BACKEND_HOST_URL: string
        ITEMS_PER_PAGE: number
        BRAND_NAME: string
        FRONTEND_HOST_URL: string
        CRYPTO_SECRET_KEY: string
        BCRYPT_SALTROUND: string
        COINGECKO: {
                URL: string
                API_KEY: string
        }
        JWT: {
                SECRET: string
                EXPIRY: string
        }
        AWS: {
                ACCESS_KEY: string
                SECRET_KEY: string
                REGION: string
                S3: {
                        BUCKET: string
                        ACL: string
                        USER_FOLDER: string
                        PROFILE_FOLDER: string
                        PROJECT_FOLDER: string
                        PROJECT_TOKEN_FOLDER: string
                        PROJECT_TOKEN_SYMBOL_FOLDER: string
                        PROJECT_TOKEN_DISTRIBUTION_PLAN_FOLDER: string
                        PROJECT_TEAM_FOLDER: string
                        PROJECT_TEAM_PROFILE_FOLDER: string
                        PROJECT_ROAD_MAP_FOLDER: string
                        PROJECT_OTHER_FOLDER: string
                }
                SES: {
                        API_VERSION: string
                        SENDER_EMAIL: string
                }
        }
        ALCHEMY: {
                API_KEY: string
                AUTH_TOKEN: string
                ADDRESS_WEBHOOK_ID: string
                ADDRESS_WEBHOOK_SIGNING_KEY: string
        }
        CONTRACT: {
                ICO: {
                        CONTRACT_ADDRESS: string
                }
                TOKEN: {
                        CONTRACT_ADDRESS: string
                }
        }
        POLYGON: {
                RPC_URL_WSS: string
                RPC_URL_HTTPS: string
        }
        BACKEND_HOSTED_URL: string
        COIN_API: {
                API_KEY: string
        }
        FIREBASE_SECRET_NAME: string
        AUTH_API_URL: string
        HOLOBANK: {
                API_KEY: string
                API_URL: string
                WEBHOOK_SECRET: string
        }
        RANGO: {
                API_KEY: string
        }

}

export default (): ConfigInterface => {
        const { NODE_ENV } = process.env
        const environment = NODE_ENV?.toLowerCase()
        const environmentFileLocation = `${__dirname}/../environments`
        const environmentFilePath = `${environmentFileLocation}/${environment}`
        if (FileExistsSync(environmentFilePath)) {
                // eslint-disable-next-line
                const configuration: ConfigInterface = require(environmentFilePath).default()
                return configuration
        } else {
                Logger.error(App.Message.Error.MissingEnvFile({ environment }))
                throw Error(App.Message.Error.MissingEnvFile({ environment }))
        }
}
