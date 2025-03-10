import mongoose, { mongo } from 'mongoose';
/* 
  0 - disconnected
  1 - connected
  2 - connecting
  3 - disconnecting
  4 - uninitialized
*/
const mongoConnection = {
  isConnected: 0,
};

const mongoCreds = {
  user: "site242511",
  psw: "Eeb1uoGi",
  site: "mongo_site242511",
  dbName: "test"
}

const MONGO_URL_DEV = 'mongodb+srv://Beverini:gT6YzKMjNKt3crEe@devdb.lu8sk.mongodb.net/?retryWrites=true&w=majority&appName=DevDB'
const MONGO_URL_PROD = `mongodb://${mongoCreds.user}:${mongoCreds.psw}@${mongoCreds.site}/${mongoCreds.dbName}?authSource=admin&writeConcern=majority`
const MONGO_URL = (process.env.NODE_ENV === "development") ? MONGO_URL_DEV : MONGO_URL_PROD

export const dbConnect = async () => {
  console.log('MONGO_URL', MONGO_URL);
  if (mongoConnection.isConnected === 1) {
    console.log('ya estabamos conectados');
    return;
  }

  if (mongoose.connections.length > 0) {
    mongoConnection.isConnected = mongoose.connections[0].readyState;
    if (mongoConnection.isConnected === 1) {
      console.log('usando conexion existente');
      return;
    }

    await mongoose.disconnect();
  }
  await mongoose.connect(MONGO_URL ?? '');
  mongoConnection.isConnected = 1;
  console.log('conectado a mongodb', MONGO_URL ?? '');
};

export const dbDisconnect = async () => {
  if (process.env.NODE_ENV === 'development') return;
  if (mongoConnection.isConnected === 0) return;

  await mongoose.disconnect();
  mongoConnection.isConnected = 0;
  console.log('desconectado de mongodb');
};
