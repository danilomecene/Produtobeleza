// ==========================================
// CONFIGURAÇÕES
// ==========================================
const ASAAS_API_KEY = '$aact_YdacU262NDc...SUA_CHAVE_AQUI'; // Insira seu Access Token do Asaas
const ASAAS_BASE_URL = 'https://www.asaas.com/api/v3'; // Use https://sandbox.asaas.com/api/v3 para testes

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Se a planilha estiver vazia, adiciona os cabeçalhos das colunas
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Data/Hora', 
        'Nome', 
        'E-mail', 
        'Telefone', 
        'Endereço', 
        'Bairro', 
        'Cidade', 
        'Estado', 
        'CEP', 
        'Kit', 
        'Valor Total', 
        'Status Pagamento', 
        'ID Cobrança Asaas'
      ]);
    }

    // Define o valor do kit
    const valoresKits = { '1': 40.00, '3': 120.00, '6': 210.00 };
    const valorTotal = valoresKits[data.kit] || 120.00;

    // 1. PASSO: Criar ou Cadastrar Cliente no Asaas
    const customerPayload = {
      name: data.nombre || 'Cliente',
      email: data.email || '',
      phone: data.telefono || '',
      mobilePhone: data.telefono || '',
      address: data.direccion || '',
      addressNumber: 'SN',
      province: data.colonia || '',
      postalCode: data.cp || '',
      notificationDisabled: false
    };

    const customerOptions = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'access_token': ASAAS_API_KEY, 'User-Agent': 'DiamondCosmeticos' },
      payload: JSON.stringify(customerPayload),
      muteHttpExceptions: true
    };

    const custResponse = UrlFetchApp.fetch(ASAAS_BASE_URL + '/customers', customerOptions);
    const custResult = JSON.parse(custResponse.getContentText());

    if (!custResult.id) {
      throw new Error(custResult.errors ? custResult.errors[0].description : 'Erro ao criar cliente no Asaas');
    }

    const customerId = custResult.id;

    // 2. PASSO: Criar a Cobrança no Asaas
    const paymentPayload = {
      customer: customerId,
      billingType: 'UNDEFINED', // Permite o cliente escolher PIX ou Cartão na tela do Asaas
      value: valorTotal,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Vencimento em 1 dia
      description: 'Love Spell Body Splash - Kit ' + data.kit,
      externalReference: 'KIT_' + data.kit + '_' + Date.now()
    };

    const paymentOptions = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'access_token': ASAAS_API_KEY, 'User-Agent': 'DiamondCosmeticos' },
      payload: JSON.stringify(paymentPayload),
      muteHttpExceptions: true
    };

    const payResponse = UrlFetchApp.fetch(ASAAS_BASE_URL + '/payments', paymentOptions);
    const payResult = JSON.parse(payResponse.getContentText());

    if (!payResult.invoiceUrl) {
      throw new Error(payResult.errors ? payResult.errors[0].description : 'Erro ao gerar cobrança no Asaas');
    }

    // 3. PASSO: Salvar os Dados na Planilha (CSV)
    sheet.appendRow([
      new Date(),
      data.nombre,
      data.email,
      data.telefono,
      data.direccion,
      data.colonia,
      data.ciudad,
      data.estado,
      data.cp,
      'Kit ' + data.kit,
      valorTotal,
      'AGUARDANDO_PAGAMENTO',
      payResult.id
    ]);

    // Retorna a URL da fatura do Asaas para o navegador redirecionar o cliente
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      paymentUrl: payResult.invoiceUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
