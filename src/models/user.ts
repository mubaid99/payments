
import { Role } from '@core/constants'
import { BaseModel } from '@core/database'

import { Document, model, Model, Schema } from 'mongoose'
const { ObjectId } = Schema.Types

// Holobank related interfaces
export interface IBankAccount {
  accountId: string
  type: string
  currency: string
  balance?: number
}

export interface IBankCard {
  cardId: string
  type: string
  limit: number
  status: string
}

export interface IBankDetails {
  holobankUserId?: string
  userReferenceId?: string
  kycId?: string
  accounts: IBankAccount[]
  cards: IBankCard[]
  kycStatus?: string
}

export interface ITokenInfo {
        contractAddress: string;
        symbol: string;
        decimals: number;
        isNative: boolean;
        chainId: number;
        lastKnownBalance?: string;
        lastUpdated?: Date;
  }
  
  export interface IWalletAddress {
        address: string;
        label?: string;
        isPrimary: boolean;
        tokens: ITokenInfo[];
        chainId: number;
        network: string;
  }

const TokenInfoSchema = new Schema<ITokenInfo>({
        contractAddress: {
          type: String,
          required: true
        },
        symbol: {
          type: String,
          required: true
        },
        decimals: {
          type: Number,
          default: 18
        },
        isNative: {
          type: Boolean,
          default: false
        },
        chainId: {
          type: Number,
          required: true
        },
        lastKnownBalance: String,
        lastUpdated: Date
  }, { _id: false })
  
  const WalletAddressSchema = new Schema<IWalletAddress>({
        address: {
          type: String,
        },
        label: String,
        isPrimary: {
          type: Boolean,
          default: false
        },
        tokens: [TokenInfoSchema],
        chainId: {
          type: Number,
         
        },
        network: {
          type: String,
         
        }
  }, { _id: false })

// Bank account schema
const BankAccountSchema = new Schema<IBankAccount>({
  accountId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  }
}, { _id: false })

// Bank card schema
const BankCardSchema = new Schema<IBankCard>({
  cardId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive', 'suspended', 'expired']
  }
}, { _id: false })

// Bank details schema
const BankDetailsSchema = new Schema<IBankDetails>({
  holobankUserId: String,
  userReferenceId: String,
  kycId: String,
  accounts: {
    type: [BankAccountSchema],
    default: []
  },
  cards: {
    type: [BankCardSchema],
    default: []
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  }
}, { _id: false })

  export interface UserInput {
        username: string
        walletAddress?: string
        wallets: IWalletAddress[];
        roleId: typeof ObjectId
        isVerified: boolean
}

export interface AdminInput {
        fullName?: string
        email?: string
        mobile: number
        countryCode: string
        roleId: typeof ObjectId
}

interface UserAttrs extends UserInput {
        accountTypeCode: Role
}

interface AdminAttrs extends AdminInput {
        accountTypeCode: Role
}

export interface UserSchemaDoc extends UserDoc {
        
}
export interface UserModel extends Model<UserSchemaDoc> {
        build(attrs: UserAttrs | AdminAttrs): UserDoc
        getById(value: string, projection: any): UserDoc
        getByEmail(email: string): UserDoc
}

export interface UserDoc extends BaseModel, Document {
        _id: typeof ObjectId
        username?: string
        fullName: string
        wallets: IWalletAddress[];
        walletAddress?: string
        email?: string
        emailVerifiedAt?: Date
        countryCode?: string
        mobile?: string
        mobileVerifiedAt?: Date
        password?: string
        passwordChangedAt?: Date
        permissions?: number[]
        totalCollections?: number
        isEmailVerified?: boolean
        roleId: typeof ObjectId
        totalVolume?: number
        floorPrice?: number
        _broker?: typeof ObjectId
        verification?: {
                codeType: string
                referenceCode: string
                code: string
        }[]
        FCMToken?: string[]
        accountTypeCode: Role
        profilePic?: string
        coverPic?: string
        description?: string
        socialLinks?: {
                facebook?: string
                twitter?: string
                instagram?: string
                blog?: string
                website?: string
                discord?: string
        }
        notificationSetting: {
                itemSold: boolean
                bidActivity: boolean
                priceChange: boolean
                outbid: boolean
                itemBought: boolean
                newsletter: boolean
        }
        isPublic: string
        tags?: string[]
        isFirstLogin?: boolean
        isProfileDetailsUpdated?: boolean
        isQrGenerated?: boolean
        followingCount?: number
        followerCount?: number
        isVerified?: boolean
        isVerifiedFromBlockchain?: boolean
        isActive: boolean
        isCollectionAccess: boolean
        isRequestedCollectionAccess: boolean
        collectionAccessStatus: string
        rejectReason: string
        address: string
        isBlocked: boolean
        isBanned: boolean
        signature: string
        data: string
        reason: string
        isWhitelisted: boolean
        isRequestForwhitelist: boolean
        isDeleted: boolean
        createdById:typeof ObjectId
        updatedById:typeof ObjectId
        bankDetails?: IBankDetails
}

const UserSchema = new Schema<UserSchemaDoc>(
        {
                username: { type: String, sparse: true },
                fullName: { type: String },
                walletAddress: String,
                wallets: {
                        type: [WalletAddressSchema],
                        default: []
                  },
                email: { type: String, sparse: true },
                emailVerifiedAt: Date,
                isEmailVerified: { type: Boolean, default: false },
                countryCode: { type: String },
                mobile: { type: String, sparse: true },
                mobileVerifiedAt: Date,
                password: { type: String, select: false },
                passwordChangedAt: { type: Date },
                permissions: [Number],
                totalCollections: { type: Number, default: 0 },
                roleId: { type: ObjectId, ref: 'Role' },
                _broker: { type: ObjectId, ref: 'Broker' },
                totalVolume: { type: Number, default: 0 },
                floorPrice: { type: Number, default: 0 },
                verification: {
                        type: [
                                {
                                        codeType: {
                                                type: String,
                                                enum: ['forgotPassword', 'resetPassword', 'twoFA', null],
                                        },
                                        referenceCode: String,
                                        code: String,
                                },
                        ],
                        _id: false,
                        select: false,
                },
                FCMToken: [String],
                accountTypeCode: {
                        type: String,
                        default: Role.USER,
                        enum: [Role.USER, Role.SUPER_ADMIN, Role.ADMIN],
                },
                profilePic: { type: String },
                coverPic: { type: String },
                description: { type: String },
                socialLinks: {
                        type: {
                                facebook: String,
                                twitter: String,
                                instagram: String,
                                blog: String,
                                website: String,
                                discord: String,
                        },
                        default: {
                                facebook: '',
                                twitter: '',
                                instagram: '',
                                blog: '',
                                website: '',
                        },
                        _id: false,
                },
                notificationSetting: {
                        itemSold: {
                                type: Boolean,
                                default: true,
                        },
                        bidActivity: {
                                type: Boolean,
                                default: true,
                        },
                        priceChange: {
                                type: Boolean,
                                default: true,
                        },
                        outbid: {
                                type: Boolean,
                                default: true,
                        },
                        itemBought: {
                                type: Boolean,
                                default: true,
                        },
                        newsletter: {
                                type: Boolean,
                                default: true,
                        },
                },
                isPublic: { type: String, default: 'public', enum: ['public', 'private'] },
                tags: [String],
                signature: { type: String },
                data: { type: String },
                reason: { type: String },
                isFirstLogin: { type: Boolean, default: true },
                isProfileDetailsUpdated: { type: Boolean, default: false },
                isQrGenerated: { type: Boolean, default: false },
                followingCount: { type: Number, default: 0 },
                followerCount: { type: Number, default: 0 },
                isVerified: { type: Boolean, default: false },
                isVerifiedFromBlockchain: { type: Boolean, default: false },
                isBlocked: { type: Boolean, default: false },
                isBanned: { type: Boolean, default: false },
                isDeleted: { type: Boolean, default: false },
                isActive: { type: Boolean, default: true },
                createdById: { type: ObjectId, ref: 'User', select: false },
                updatedById: { type: ObjectId, ref: 'User', select: false },
                isCollectionAccess: { type: Boolean, default: false },
                collectionAccessStatus: { type: String, default: 'pending' },
                rejectReason: { type: String },
                address: { type: String },
                isRequestedCollectionAccess: { type: Boolean, default: false },
                isWhitelisted: { type: Boolean, default: false },
                isRequestForwhitelist: { type: Boolean, default: false },
                bankDetails: {
                        type: BankDetailsSchema,
                        default: {
                                accounts: [],
                                cards: [],
                                kycStatus: 'pending'
                        }
                },
        },
        {
                autoIndex: true,
                versionKey: false,
                timestamps: true,
        }
)


export const User = model<UserSchemaDoc, UserModel>('User', UserSchema)
