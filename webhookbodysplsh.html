<script>
  // 1. Cole aqui a URL exata do seu Webhook do Google Apps Script (que termina em /exec)
  const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyn7bc2IKducboz7zfLnwcIxQQhKK7biw1ed5vy5Ge78sRgvzXBvE5nQzCB9uFhMbJT-w/exec";

  // 2. Função acionada ao enviar o formulário de checkout
  document.getElementById('checkout-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento da página

    // Captura os dados preenchidos nos campos
    const dadosFormulario = {
      nome: document.getElementById('nome') ? document.getElementById('nome').value : 'Cliente',
      email: document.getElementById('email') ? document.getElementById('email').value : 'cliente@email.com',
      produto: "Seu Produto/Serviço",
      preco: 10.00 // Ou o valor do seu produto
    };

    // Alerta/feedback visual de carregamento para o cliente
    const btnPagar = document.querySelector('button[type="submit"]');
    if (btnPagar) {
      btnPagar.disabled = true;
      btnPagar.innerText = "A redirecionar para o pagamento...";
    }

    // Envia os dados para o Webhook do Google Apps Script
    fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // Compatível com Google Apps Script sem erro de CORS
      },
      body: JSON.stringify(dadosFormulario)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.paymentUrl) {
        // REDIRECIONAMENTO AUTOMÁTICO PARA O MERCADO PAGO
        window.location.href = data.paymentUrl;
      } else {
        alert("Atenção: " + (data.error || "Não foi possível gerar a ligação de pagamento."));
        if (btnPagar) {
          btnPagar.disabled = false;
          btnPagar.innerText = "Pagar Agora";
        }
      }
    })
    .catch(error => {
      console.error('Erro na requisição:', error);
      alert("Falha na comunicação com o servidor de pagamento.");
      if (btnPagar) {
        btnPagar.disabled = false;
        btnPagar.innerText = "Pagar Agora";
      }
    });
  });
</script>
