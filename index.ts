import dotenv from 'dotenv';
import app from './src/routes/index.ts';
import connectDatabase from './src/models/index.ts';
import { successResponse } from './src/utils/response.ts';

dotenv.config();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  successResponse(res, 'Billing & Inventory API is running');
});

(async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (exception) {
    console.log('Something went wrong');
    if (exception instanceof Error) {
      console.log(exception.message);
    }
  }
})();