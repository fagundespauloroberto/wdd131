// Configuração do Supabase
const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // 1. Resgatar o ID do pet a partir dos parâmetros de URL (?pet_id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('pet_id');

    // 2. Controlar exibições condicionais do formulário
    configurarExibicaoCondicional();

    // 3. Gerenciar o envio do formulário
    const formCandidato = document.getElementById('formCandidato');
    if (formCandidato) {
        formCandidato.addEventListener('submit', (e) => salvarCandidato(e, petId));
    }
});

function configurarExibicaoCondicional() {
    // Cônjuge
    const elEstadoCivil = document.getElementById('estadoCivil');
    const grupoConjuge = document.getElementById('grupoConjuge');
    elEstadoCivil?.addEventListener('change', () => {
        grupoConjuge.style.display = (elEstadoCivil.value === 'casado') ? 'flex' : 'none';
    });

    // Tipo de Moradia (Casa / Apto)
    const elTipoResidencia = document.getElementById('tipoResidencia');
    const grupoApto = document.getElementById('grupoApto');
    const grupoCasa = document.getElementById('grupoCasa');
    elTipoResidencia?.addEventListener('change', () => {
        grupoApto.style.display = (elTipoResidencia.value === 'apto') ? 'block' : 'none';
        grupoCasa.style.display = (elTipoResidencia.value === 'casa') ? 'block' : 'none';
    });

    // Imóvel Alugado
    const elSituacaoResidencia = document.getElementById('situacaoResidencia');
    const grupoAlugada = document.getElementById('grupoAlugada');
    elSituacaoResidencia?.addEventListener('change', () => {
        grupoAlugada.style.display = (elSituacaoResidencia.value === 'alugada') ? 'block' : 'none';
    });

    // Histórico de Pets
    const elTeveAnimais = document.getElementById('teveAnimais');
    const grupoDetalhesAnimais = document.getElementById('grupoDetalhesAnimais');
    elTeveAnimais?.addEventListener('change', () => {
        grupoDetalhesAnimais.style.display = (elTeveAnimais.value === 'sim') ? 'block' : 'none';
    });
}

async function salvarCandidato(event, petId) {
    event.preventDefault();

    const btnSubmit = event.target.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Enviando candidatura...';

    // Captura dos valores do formulário
    const estadoCivil = document.getElementById('estadoCivil').value;
    const tipoResidencia = document.getElementById('tipoResidencia').value;
    const situacaoResidencia = document.getElementById('situacaoResidencia').value;
    const teveAnimais = document.getElementById('teveAnimais').value;

    // Estrutura do objeto para inserção na tabela
    const dadosCandidato = {
        pet_id: petId ? parseInt(petId, 10) : null,
        nome: document.getElementById('nome').value.trim(),
        data_nascimento: document.getElementById('dataNascimento').value,
        estado_civil: estadoCivil,
        profissao: document.getElementById('profissao').value.trim(),
        local_trabalho: document.getElementById('localTrabalho').value.trim(),
        
        // Cônjuge (só envia dados se for casado)
        nome_conjuge: (estadoCivil === 'casado') ? document.getElementById('nomeConjuge').value.trim() : null,
        profissao_conjuge: (estadoCivil === 'casado') ? document.getElementById('profissaoConjuge').value.trim() : null,

        cidade: document.getElementById('cidade').value.trim(),
        bairro: document.getElementById('bairro').value.trim(),
        tipo_residencia: tipoResidencia,
        situacao_residencia: situacaoResidencia,
        tempo_residencia: document.getElementById('tempoResidencia').value.trim(),

        // Condicionais de imóvel alugado, apartamento ou casa
        proprietario_permite: (situacaoResidencia === 'alugada') ? document.getElementById('proprietarioPermite').value : null,
        sindico_permite: (tipoResidencia === 'apto') ? document.getElementById('sindicoPermite').value : null,
        janelas_teladas: (tipoResidencia === 'apto') ? document.getElementById('janelasTeladas').value : null,
        possui_patio: (tipoResidencia === 'casa') ? document.getElementById('possuiPatio').value : null,
        casa_cercada: (tipoResidencia === 'casa') ? document.getElementById('casaCercada').value : null,

        // Condicionais de histórico com animais
        teve_animais: teveAnimais,
        quais_e_quantos: (teveAnimais === 'sim') ? document.getElementById('quaisEQuantos').value.trim() : null,
        sao_castrados: (teveAnimais === 'sim') ? document.getElementById('saoCastrados').value : null,
        sao_vacinados: (teveAnimais === 'sim') ? document.getElementById('saoVacinados').value : null
    };

    try {
        const { error } = await _supabase
            .from('candidatos')
            .insert([dadosCandidato]);

        if (error) throw error;

        alert('Sua ficha de candidatura foi enviada com sucesso! O responsável pelo pet entrará em contato.');
        window.location.href = 'index.html';

    } catch (err) {
        console.error('Erro ao salvar candidatura:', err);
        alert('Ocorreu um erro ao enviar sua ficha. Por favor, verifique os campos e tente novamente.');
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'Enviar Ficha para Análise';
    }
}