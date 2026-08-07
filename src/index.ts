import dotenv from 'dotenv';
import app from './server';
import logger from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`KGB Backend server running on port ${PORT}`);
});
