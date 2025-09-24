import mongoose from 'mongoose';

const attivitaSchema = new mongoose.Schema(
	{
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
			enum: ['todo', 'done'], 
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
		}
	}
);

// Esporta il modello, creandolo se non esiste già
export const Attivita = mongoose.models.Attivita || mongoose.model('Attivita', attivitaSchema);