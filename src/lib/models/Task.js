import mongoose from 'mongoose';

const attivitaSchema = new Schema(
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

export const Tasks = model('Tasks', attivitaSchema);