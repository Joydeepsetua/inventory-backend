import express from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', '*'],
  allowedHeaders: ['Content-Type', '*']
}));
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


export default app;