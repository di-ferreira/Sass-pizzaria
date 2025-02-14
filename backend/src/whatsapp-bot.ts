import { create } from 'venom-bot';

let clientGlobal: any = null;
export const createWhatsAppClient = async () => {
  if (clientGlobal) {
    console.log('Cliente já inicializado.');
    return clientGlobal;
  }

  return create({
    session: 'pizzaria-bot',
    catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR); // Exibe o QR Code no terminal (opcional)
      const matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const imageBuffer = Buffer.from(matches[2], 'base64');
        require('fs').writeFile(
          'out.png',
          imageBuffer,
          'binary',
          (err: any) => {
            if (err) {
              console.error('Erro ao salvar o QR Code:', err);
            } else {
              console.log('QR Code salvo como out.png');
            }
          }
        );
      } else {
        console.error('Formato inválido do QR Code');
      }
    },
    logQR: false,
    headless: 'new',
    statusFind: (statusSession, session) => {
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
    // headless: 'new',
  })
    .then((client) => {
      console.log('Cliente WhatsApp conectado!');
      clientGlobal = client;
      // Escutar mensagens recebidas
      client.onMessage((message) => {
        if (message.body === '!menu') {
          client.sendText(
            message.from,
            'Bem-vindo ao menu! Digite 1 para cardápio ou 2 para suporte.'
          );
        }
      });
    })
    .catch((error) => {
      console.error('Erro ao conectar o WhatsApp:', error);
    });
};
export const getClient = () => {
  if (!clientGlobal) {
    throw new Error('Cliente não inicializado');
  }
  return clientGlobal;
};
