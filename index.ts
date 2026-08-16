import "dotenv/config";

import app from "./src/routes/index.js";
import connectDatabase from "./src/models/index.js";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (exception) {
    console.log("Something went wrong");
    if (exception instanceof Error) {
      console.log(exception.message);
    }
    process.exit(1);
  }
})();
