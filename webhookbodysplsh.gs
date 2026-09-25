// Webhook / Backend - Google Apps Script
const ASAAS_API_KEY = 'SUA_CHAVE_API_ASAAS_AQUI'; // Insira sua API Key do Asaas
const ASAAS_URL = 'https://www.asaas.com/api/v3/payments'; 

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 1. Salva os dados do pedido na Planilha / CSV
    sheet.appendRow([
      new Date(),
      data.nome,
      data.email,
      data.cpf,
      data.telefone,
      data.valor,
      'AGUARDANDO_PAGAMENTO'
    ]);

    // 2. Prepara a chamada para a API do Asaas
    const payloadAsaas = {
      billingType: 'PIX',
      value: parseFloat(data.valor),
      dueDate: new Date().toISOString().split('T')[0],
      description: 'Compra Body Splash',
      customerData: {
        name: data.nome,
        cpfCnpj: data.cpf,
        email: data.email,
        phone: data.telefone
      }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'access_token': ASAAS_API_KEY },
      payload: JSON.stringify(payloadAsaas),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(ASAAS_URL, options);
    const result = JSON.parse(response.getContentText());

    // 3. Solicita o QR Code PIX e Copia e Cola ao Asaas
    const qrCodeUrl = ASAAS_URL + '/' + result.id + '/pixQrCode';
    const qrResponse = UrlFetchApp.fetch(qrCodeUrl, { headers: { 'access_token': ASAAS_API_KEY } });
    const qrData = JSON.parse(qrResponse.getContentText());

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      encodedImage: qrData.encodedImage, // Imagem Base64 do QR Code
      payload: qrData.payload           // Chave Copia e Cola
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}