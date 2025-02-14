import express, { Request, Response, Router } from 'express';
import { readFileSync } from 'fs';
import { createWhatsAppClient, getClient } from '../whatsapp-bot';

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

router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const client = getClient();
    const chats = await client.getAllChats(); // Obtém todas as conversas
    const activeConversations = chats.filter((chat: any) => !chat.isGroup); // Filtra apenas conversas individuais

    res.status(200).json(activeConversations);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conversas ativas' });
  }
});

router.get('/conversations/new', async (req: Request, res: Response) => {
  try {
    const client = getClient();
    const chats = await client.getAllChats(); // Obtém todas as conversas

    const activeConversations = chats.filter(
      (chat: any) => !chat.isGroup && chat.unreadCount > 0
    ); // Filtra apenas conversas individuais

    res.status(200).json(activeConversations);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conversas ativas' });
  }
});

// Rota para enviar mensagem em uma conversa
router.post('/conversations/:id/send', async (req: Request, res: Response) => {
  try {
    const client = getClient();
    const chatId = req.params.id;
    const { message } = req.body; // Obtém a mensagem do corpo da requisição

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    await client.sendText(chatId, message); // Envia a mensagem
    res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Rota para listar mensagens de uma conversa
router.get(
  '/conversations/:id/messages',
  async (req: Request, res: Response) => {
    try {
      const client = getClient();
      const chatId = req.params.id;

      const messages = await client.getAllMessagesInChat(chatId); // Obtém a conversa pelo ID
      console.log('parametro', chatId);

      // const messages = await chat.fetchMessages(); // Obtém as mensagens da conversa
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
  }
);

// // Rota para marcar mensagens como lidas
// router.post(
//   '/conversations/:id/mark-as-read',
//   async (req: Request, res: Response) => {
//     try {
//       const client = getClient();
//       const chatId = req.params.id;

//       const chat = await client.getChatById(chatId); // Obtém a conversa pelo ID
//       if (!chat) {
//         return res.status(404).json({ error: 'Conversa não encontrada' });
//       }

//       await chat.sendSeen(); // Marca as mensagens como lidas
//       res.status(200).json({ message: 'Mensagens marcadas como lidas!' });
//     } catch (error) {
//       res.status(500).json({ error: 'Erro ao marcar mensagens como lidas' });
//     }
//   }
// );

// // Rota para enviar arquivos
// router.post(
//   '/conversations/:id/send-file',
//   async (req: Request, res: Response) => {
//     try {
//       const client = getClient();
//       const chatId = req.params.id;
//       const { filePath, caption } = req.body; // Caminho do arquivo e legenda

//       if (!filePath) {
//         return res
//           .status(400)
//           .json({ error: 'Caminho do arquivo é obrigatório' });
//       }

//       await client.sendFile(chatId, filePath, caption); // Envia o arquivo
//       res.status(200).json({ message: 'Arquivo enviado com sucesso!' });
//     } catch (error) {
//       res.status(500).json({ error: 'Erro ao enviar arquivo' });
//     }
//   }
// );

// Rota para obter status de conexão
router.get('/status', async (req: Request, res: Response) => {
  try {
    const client = getClient();
    const isConnected = await client.isConnected(); // Verifica se o bot está conectado

    res.status(200).json({ connected: isConnected });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar status de conexão' });
  }
});

// Rota para desconectar o bot
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    const client = getClient();
    await client.logout(); // Desconecta o bot
    res.status(200).json({ message: 'Bot desconectado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desconectar o bot' });
  }
});

export default router;

