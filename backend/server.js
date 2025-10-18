import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './logger.js';
import indexRouter from './routes/index.js';


const app = express();
app.use(cors());
app.use(express.json());


app.use('/api', indexRouter);


// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));


const PORT = process.env.PORT || 4000;


async function start() {
try {

    
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/experian';


await mongoose.connect(mongoUrl, { dbName: 'experian' });
logger.info('MongoDB connected');
app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));
} catch (err) {
logger.error('Failed to start', err);
process.exit(1);
}
}


if (process.env.NODE_ENV !== 'test') start();


export default app; 