<?php
// ==========================================
// CONFIGURAÇÕES DA API DO ASAAS
// ==========================================
// Substitua pelo seu Access Token gerado no Asaas
$apiKey = '$aact_YdacU262NDc...SUA_CHAVE_AQUI'; 

// URL da API (Use https://sandbox.asaas.com/api/v3 para testes ou https://api.asaas.com/v3 para produção)
$apiUrl = 'https://www.asaas.com/api/v3';

// ==========================================
// 1. CAPTURA DOS DADOS DO CHECKOUT
// ==========================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die('Acesso inválido.');
}

$nome      = $_POST['nombre'] ?? '';
$email     = $_POST['email'] ?? '';
$telefone  = $_POST['telefono'] ?? '';
$endereco  = $_POST['direccion'] ?? '';
$bairro    = $_POST['colonia'] ?? '';
$cidade    = $_POST['ciudad'] ?? '';
$estado    = $_POST['estado'] ?? '';
$cep       = $_POST['cp'] ?? '';
$kit       = $_POST['kit'] ?? '3';

// Define o valor com base no kit selecionado
$valoresKits = [
    '1' => 40.00,
    '3' => 120.00,
    '6' => 210.00
];
$valorTotal = $valoresKits[$kit] ?? 120.00;

// ==========================================
// 2. CRIAR / BUSCAR CLIENTE NO ASAAS
// ==========================================
$customerData = [
    'name' => $nome,
    'email' => $email,
    'phone' => $telefone,
    'mobilePhone' => $telefone,
    'address' => $endereco,
    'addressNumber' => 'SN',
    'province' => $bairro,
    'postalCode' => $cep,
    'notificationDisabled' => false
];

$ch = curl_init($apiUrl . '/customers');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($customerData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'access_token: ' . $apiKey,
    'User-Agent: DiamondCosmeticos'
]);

$responseCustomer = curl_exec($ch);
$httpCodeCustomer = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$customerObj = json_decode($responseCustomer, true);

if ($httpCodeCustomer !== 200 || !isset($customerObj['id'])) {
    die('Erro ao cadastrar cliente no Asaas: ' . ($customerObj['errors'][0]['description'] ?? 'Erro desconhecido'));
}

$customerId = $customerObj['id'];

// ==========================================
// 3. CRIAR A COBRANÇA (PIX / LINK)
// ==========================================
$paymentData = [
    'customer' => $customerId,
    'billingType' => 'UNDEFINED', // Permite ao cliente escolher PIX ou Cartão na tela do Asaas (ou use 'PIX')
    'value' => $valorTotal,
    'dueDate' => date('Y-m-d', strtotime('+1 day')),
    'description' => "Love Spell Body Splash - Kit {$kit}",
    'externalReference' => 'KIT_' . $kit . '_' . time()
];

$ch = curl_init($apiUrl . '/payments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'access_token: ' . $apiKey,
    'User-Agent: DiamondCosmeticos'
]);

$responsePayment = curl_exec($ch);
$httpCodePayment = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$paymentObj = json_decode($responsePayment, true);

if ($httpCodePayment === 200 && isset($paymentObj['invoiceUrl'])) {
    // Redireciona o cliente para a página de pagamento/fatura segura do Asaas
    header('Location: ' . $paymentObj['invoiceUrl']);
    exit;
} else {
    echo 'Erro ao gerar pagamento: ' . ($paymentObj['errors'][0]['description'] ?? 'Erro desconhecido');
}