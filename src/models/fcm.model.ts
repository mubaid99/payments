import mongoose, { Schema, model as Model, Document } from 'mongoose';
import constant from '@core/constants'


const { ObjectId } = Schema.Types;

// Interface for the FCM document
export interface I_FCM extends Document {
  _account: mongoose.Types.ObjectId;
  walletAddress: string;
  deviceId: string;
  os: string;
  fcmToken: string;
}

// Schema for the FCM
const fcmSchema = new Schema<I_FCM>(
  {
    _account: {
      type: ObjectId,
      ref: 'account',
    },
    walletAddress: {
      type: String,
    },
    deviceId: {
      type: String,
    },
    os: {
      type: String,
    },
    fcmToken: {
      type: String,
    },
  },
  {
    collection: constant.MODELS.FCM,
    timestamps: true,
  }
);

// Export the model
const FCMModel = Model<I_FCM>(constant.MODELS.FCM, fcmSchema)
export default FCMModel
