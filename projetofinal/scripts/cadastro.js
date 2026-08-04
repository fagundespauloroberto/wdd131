// =========================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// =========================================================
const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6a_SpxSWMPWGafvtcQdkhQ_JnP8A-qL';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================================================
// SELEÇÃO DOS ELEMENTOS DO DOM
// =========================================================
const formDoador = document.getElementById('formDoador');
const formAnimal = document.getElementById('formAnimal');
const selectDoador = document.getElementById('selectDoador');

// =========================================================
// FUNÇÕES DE CARREGAMENTO DE DADOS
// =========================================================

/**
 * Busca a lista de doadores cadastrados no banco Supabase
 * e preenche a caixa de seleção (<select>) do formulário de animais.
 */
async function carregarDoadores() {
    try {
        const { data, error } = await _supabase
            .from('doadores')
            .select('id, nome, localizacao')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar doadores no Supabase:', error.message);
            return;
        }

        // Limpa e reinicia as opções
        selectDoador.innerHTML = '<option value="">Selecione o doador cadastrado...</option>';
        
        data.forEach(doador => {
            const option = document.createElement('option');
            option.value = doador.id;
            option.textContent = `${doador.nome} (${doador.localizacao})`;
            selectDoador.appendChild(option);
        });
    } catch (err) {
        console.error('Erro inesperado ao carregar doadores:', err);
    }
}

// =========================================================
// EVENT LISTENERS (MANIPULAÇÃO DOS FORMULÁRIOS)
// =========================================================

/**
 * Evento de envio do Formulário 1: Cadastro de Doador
 */
formDoador.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoDoador = {
        nome: document.getElementById('doadorNome').value.trim(),
        email: document.getElementById('doadorEmail').value.trim(),
        whatsapp: document.getElementById('doadorWhatsapp').value.trim(),
        localizacao: document.getElementById('doadorLocalizacao').value.trim(),
        tipo: document.getElementById('doadorTipo').value
    };

    const { data, error } = await _supabase
        .from('doadores')
        .insert([novoDoador])
        .select();

    if (error) {
        alert('Erro ao cadastrar doador: ' + error.message);
    } else {
        alert('Doador cadastrado com sucesso!');
        formDoador.reset();
        await carregarDoadores(); // Recarrega a lista para selecionar o novo doador imediatamente
    }
});

/**
 * Evento de envio do Formulário 2: Cadastro do Animal
 */
formAnimal.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoAnimal = {
        doador_id: parseInt(selectDoador.value, 10),
        nome: document.getElementById('animalNome').value.trim(),
        especie: document.getElementById('animalEspecie').value,
        porte: document.getElementById('animalPorte').value,
        idade: document.getElementById('animalIdade').value.trim(),
        status: document.getElementById('animalStatus').value,
        url_foto: document.getElementById('animalFoto').value.trim(),
        descricao: document.getElementById('animalDescricao').value.trim()
    };

    const { data, error } = await _supabase
        .from('animais')
        .insert([novoAnimal]);

    if (error) {
        alert('Erro ao cadastrar o animal: ' + error.message);
    } else {
        alert('Animal cadastrado e disponibilizado para adoção com sucesso!');
        formAnimal.reset();
    }
});

// =========================================================
// INICIALIZAÇÃO DA PÁGINA
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    carregarDoadores();
});