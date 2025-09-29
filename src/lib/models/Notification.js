import mongoose, { Schema, model, Types } from 'mongoose';

const notificationSchema = new Schema({
  destinatario: { type: Types.ObjectId, ref: 'User', required: true },
  mittente: { type: Types.ObjectId, ref: 'User' },
  letta: { type: Boolean, default: false, required: true },
  tipo: {
    type: String,
    enum: ['CONDIVISIONE_POMODORO', 'EVENTO', 'ATTIVITA'],
    required: true
  },
  riferimento: { type: Types.ObjectId, required: true }
},
{
  timestamps: true 
});

export const Notifica = mongoose.models.Notifica || model('Notifica', notificationSchema);