import _ from 'lodash'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { generateKeyPairSync } from 'crypto'


interface JWTPayload extends JwtPayload {
	_id: string
	
}

class JWTHelper {
	private JWT_SECRET = App.Config.JWT.SECRET
	private JWT_EXPIRY = App.Config.JWT.EXPIRY
	private _keyDir = resolve(`${process.cwd()}/src/keys`)
	private publicKeyPath = resolve(`${this._keyDir}/rsa.pub`)
	private privateKeyPath =  resolve(`${this._keyDir}/rsa`)

	/**
	 * Get token user
	 * @param {string} payload
	 * @returns
	 */
	public async GetUser(payload: { token: string }) {
		const { token } = payload
		const verification: string | JwtPayload = await this.VerifyToken(token)
		console.log(verification)
		if (verification) {
			const user = await App.Models.User.findOne({
				_id: verification.sub,
				
			})

			return user
		}
		return null
	}

	/**
	 * Verify the token with rsa public key.
	 * @param {string} token
	 * @returns string | JwtPayload
	 */
	VerifyToken(token: string) {
		try {
			const publicKey = readFileSync(this.publicKeyPath)
			return jwt.verify(token, publicKey, {
				algorithms: ['RS256'],
			}) as JWTPayload
		} catch (error) {
			return error
		}
	}

	/**
	 * Create a signed JWT with the rsa private key.
	 * @param {*} payload
	 * @returns token
	 */
	public async GenerateToken(payload: JWTPayload): Promise<string> {
		const privateKey = readFileSync(this.privateKeyPath)

		return jwt.sign(
			payload,
			{ key: privateKey.toString(), passphrase: this.JWT_SECRET! },
			{
				algorithm: 'RS256',
				//expiresIn: _JWT_EXPIRY,
				expiresIn: `${this.JWT_EXPIRY}`,
				subject: `${payload._id}`,
			}
		)
	}

	/**
	 * Generates RSA Key Pairs for JWT authentication
	 * It will generate the keys only if the keys are not present.
	 */
	public GenerateKeys(): void {
		try {
			const keyDir = this._keyDir
			const publicKeyPath = this.publicKeyPath
			const privateKeyPath = this.privateKeyPath

			const JWT_SECRET = this.JWT_SECRET

			// Throw error if JWT_SECRET is not set
			if (!JWT_SECRET) {
				throw new Error('JWT_SECRET is not defined.')
			}

			// Check if config/keys exists or not
			if (!existsSync(keyDir)) {
				mkdirSync(keyDir)
			}

			// Check if PUBLIC and PRIVATE KEY exists else generate new
			if (!existsSync(publicKeyPath) && !existsSync(privateKeyPath)) {
				const result = generateKeyPairSync('rsa', {
					modulusLength: 4096,
					publicKeyEncoding: {
						type: 'spki',
						format: 'pem',
					},
					privateKeyEncoding: {
						type: 'pkcs8',
						format: 'pem',
						cipher: 'aes-256-cbc',
						passphrase: JWT_SECRET,
					},
				})

				const { publicKey, privateKey } = result
				writeFileSync(`${keyDir}/rsa.pub`, publicKey, { flag: 'wx' })
				writeFileSync(`${keyDir}/rsa`, privateKey, { flag: 'wx' })
				Logger.warn('New public and private key generated.')
			}
		} catch (error) {
			Logger.error(`Key generation failed: ${error.message}`)
			throw new Error(`Key generation failed: ${error.message}`)
		}
	}
}

// All Done
export default new JWTHelper()
