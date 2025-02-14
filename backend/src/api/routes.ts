import express, { Request, Response, Router } from 'express';
import { readFileSync } from 'fs';
import { createWhatsAppClient } from '../whatsapp-bot';

const router: Router = express.Router();

router.post('/connect', async (req: Request, res: Response) => {
  try {
    createWhatsAppClient();

    res.status(200).json({ message: 'Conexão iniciada!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao conectar o WhatsApp' });
  }
});

router.get('/qr', async (req: Request, res: Response) => {
  try {
    const qrCodeImage = readFileSync('./out.png');
    const base64Image = Buffer.from(qrCodeImage).toString('base64');
    console.log('qrCodeImage', base64Image);

    // Enviar a imagem como resposta
    res.send(`
      <html>
        <body>
          <h1>Escaneie o QR Code abaixo para conectar:</h1>
          <img src="data:image/png;base64,${base64Image}" alt="QR Code" />
        </body>
      </html>
    `);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Erro ao gerar o QR Code: ' + error.message });
  }
});

export default router;
