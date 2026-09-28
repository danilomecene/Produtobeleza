<script>
  // Cole aqui a URL do Webhook gerada ao Implantar no Google Apps Script
  const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyn7bc2IKducboz7zfLnwcIxQQhKK7biw1ed5vy5Ge78sRgvzXBvE5nQzCB9uFhMbJT-w/exec";

  async function enviarCheckout(produtoNome, valorProduto) {
    const dadosCliente = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      telefone: document.getElementById("telefone").value,
      endereco: document.getElementById("endereco").value,
      bairro: document.getElementById("bairro").value,
      cidade: document.getElementById("cidade").value,
      estado: document.getElementById("estado").value,
      cep: document.getElementById("cep").value,
      produto: produtoNome,     // Passa o nome de qualquer um dos 9 produtos
      valor: valorProduto,       // Passa o valor do produto
      url_retorno: window.location.href
    };

    const resposta = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dadosCliente)
    });

    const resultado = await resposta.json();

    if (resultado.success && resultado.paymentUrl) {
      window.location.href = resultado.paymentUrl; // Redireciona para o Pix / Cartão do MP
    } else {
      alert("Erro ao processar checkout: " + resultado.error);
    }
  }
</script>
