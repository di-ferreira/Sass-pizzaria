import dotenv from 'dotenv';
import express from 'express';
import botRouter from './api/routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// app.use(cors());
app.use('/bot', botRouter);

app.get('/', (req, res) => {
  res.send('Backend rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
