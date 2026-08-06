// =========================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// =========================================================
const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let usuarioLogado = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar se o usuário está logado
    const { data: { session } } = await _supabase.auth.getSession();

    if (!session) {
        alert('Você precisa estar logado para cadastrar um pet para doação.');
        window.location.href = 'login.html';
        return;
    }

    usuarioLogado = session.user;

    // Exibe o nome ou e-mail do doador logado na tela
    const elDoador = document.getElementById('nomeDoadorLogado');
    if (elDoador) {
        const nomeDoador = usuarioLogado.user_metadata?.nome_doador || usuarioLogado.email;
        elDoador.textContent = nomeDoador;
    }

    // 2. Manipular o envio do formulário
    const formAnimal = document.getElementById('formAnimal');
    if (formAnimal) {
        formAnimal.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fotoInput = document.getElementById('animalFoto');
            if (!fotoInput.files || fotoInput.files.length === 0) {
                alert('Por favor, selecione uma foto do pet.');
                return;
            }

            try {
                // Upload da Imagem
                const file = fotoInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
                const filePath = `pets/${fileName}`;

                const { error: uploadError } = await _supabase.storage
                    .from('fotos-animais')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: urlData } = _supabase.storage
                    .from('fotos-animais')
                    .getPublicUrl(filePath);

                // Preparar objeto do animal
                // O doador_id é inserido AUTOMATICAMENTE a partir do id da sessão logada!
                const novoAnimal = {
                    doador_id: usuarioLogado.id, 
                    nome: document.getElementById('animalNome').value.trim(),
                    especie: document.getElementById('animalEspecie').value,
                    porte: document.getElementById('animalPorte').value,
                    idade: document.getElementById('animalIdade').value.trim(),
                    status: document.getElementById('animalStatus').value,
                    url_foto: urlData.publicUrl,
                    descricao: document.getElementById('animalDescricao').value.trim()
                };

                const { error: dbError } = await _supabase
                    .from('animais')
                    .insert([novoAnimal]);

                if (dbError) throw dbError;

                alert('🐾 Pet cadastrado para doação com sucesso!');
                formAnimal.reset();

            } catch (err) {
                console.error('Erro no cadastro:', err);
                alert('Erro ao cadastrar pet: ' + err.message);
            }
        });
    }
});
