import mongoose from 'mongoose';

const attivitaSchema = new mongoose.Schema({
<<<<<<< HEAD
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['todo', 'done', 'late'], 
        default: 'todo' 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    lastNotificationLevel: {
        type: String,
        enum: ['Nessuna', 'Imminente', 'Oggi', 'Scaduta'],
        default: 'Nessuna'
    },
    listItemId: {
        type: mongoose.Schema.Types.ObjectId
    }
=======
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['todo', 'done', 'late'],
    default: 'todo'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Usa il percorso completo
    required: true,
    ref: 'User'
  },
  lastNotificationLevel: {
    type: String,
    enum: ['Nessuna', 'Imminente', 'Oggi', 'Scaduta'],
    default: 'Nessuna'
  },
  listItemId: {
    type: mongoose.Schema.Types.ObjectId
  }
>>>>>>> 7b57e11761663d9be02e694b73c867e1383db5c9
});

export const Task = mongoose.model('Task', attivitaSchema);
