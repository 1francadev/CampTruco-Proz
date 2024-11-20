let pontuacaoDupla1 = 0;
let pontuacaoDupla2 = 0;
let contagemVencedor = false;

function atualizarPlacar() {
    document.getElementById('resultado').textContent = `${pontuacaoDupla1} x ${pontuacaoDupla2}`;
}

// Função para adicionar pontos e verificar se há um vencedor
function adicionarPontos(dupla) {
    if (contagemVencedor) return; // Evita adicionar pontos após ter um vencedor

    if (dupla === 'dupla1') {
        pontuacaoDupla1 += 2;
    } else if (dupla === 'dupla2') {
        pontuacaoDupla2 += 2;
    }
    atualizarPlacar();
    verificarVencedor();
}

// Função para verificar o vencedor
function verificarVencedor() {
    if (pontuacaoDupla1 >= 12) {
        console.log('A dupla 1 é vencedora!');
        contagemVencedor = true;
        enviarParaAPI(contagemVencedor, 'dupla1');
    } else if (pontuacaoDupla2 >= 12) {
        console.log('A dupla 2 é vencedora!');
        contagemVencedor = true;
        enviarParaAPI(contagemVencedor, 'dupla2');
    }
}

// Função para enviar o valor atualizado para a API
async function enviarParaAPI(valor, duplaVencedora) {
  try {
    const resposta = await fetch('https://api.exemplo.com/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vencedor: valor, dupla: duplaVencedora }),
    });

    if (resposta.ok) {
      console.log('Resultado enviado com sucesso:', { vencedor: valor, dupla: duplaVencedora });
    } else {
      console.error('Erro ao enviar o resultado');
    }
  } catch (erro) {
    console.error('Erro na requisição:', erro);
  }
}

// Função para iniciar uma nova partida
function novaPartida() {
    pontuacaoDupla1 = 0;
    pontuacaoDupla2 = 0;
    contagemVencedor = false;
    atualizarPlacar();
}