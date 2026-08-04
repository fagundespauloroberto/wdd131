// =========================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// =========================================================
const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

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
if (formAnimal) {
    formAnimal.addEventListener('submit', async (e) => {
        e.preventDefault();

        const doadorId = selectDoador.value;
        const fotoInput = document.getElementById('animalFoto');

        if (!doadorId) {
            alert('Selecione um doador responsável!');
            return;
        }

        if (!fotoInput.files || fotoInput.files.length === 0) {
            alert('Por favor, selecione uma foto para o pet.');
            return;
        }

        const file = fotoInput.files[0];
        // Cria um nome único usando timestamp e extensão original
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `pets/${fileName}`;

        try {
            // 1. Upload do arquivo para o bucket 'fotos-animais'
            const { error: uploadError } = await _supabase
                .storage
                .from('fotos-animais')
                .upload(filePath, file);

            if (uploadError) {
                throw new Error('Falha no upload da imagem: ' + uploadError.message);
            }

            // 2. Obter a URL pública do arquivo enviado
            const { data: urlData } = _supabase
                .storage
                .from('fotos-animais')
                .getPublicUrl(filePath);

            const urlFotoPublica = urlData.publicUrl;

            // 3. Salvar registro do animal no banco de dados com a URL gerada
            const novoAnimal = {
                doador_id: parseInt(doadorId, 10),
                nome: document.getElementById('animalNome').value.trim(),
                especie: document.getElementById('animalEspecie').value,
                porte: document.getElementById('animalPorte').value,
                idade: document.getElementById('animalIdade').value.trim(),
                status: document.getElementById('animalStatus').value,
                url_foto: urlFotoPublica,
                descricao: document.getElementById('animalDescricao').value.trim()
            };

            const { error: dbError } = await _supabase
                .from('animais')
                .insert([novoAnimal]);

            if (dbError) {
                throw new Error('Erro ao salvar no banco: ' + dbError.message);
            }

            alert('Animal e foto cadastrados com sucesso!');
            formAnimal.reset();

        } catch (err) {
            alert(err.message);
            console.error('Erro no processo de cadastro do animal:', err);
        }
    });
}

// =========================================================
// INICIALIZAÇÃO DA PÁGINA
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    carregarDoadores();
});