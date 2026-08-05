// =========================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// =========================================================
const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let usuarioLogado = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar se o usuário está autenticado
    const { data: { session } } = await _supabase.auth.getSession();

    if (!session) {
        alert('Sessão expirada ou usuário não autenticado. Faça login para continuar.');
        window.location.href = 'login.html';
        return;
    }

    usuarioLogado = session.user;

    const formAnimal = document.getElementById('formAnimal');
    const fotoInput = document.getElementById('animalFoto');

    // 2. Evento do Cadastro de Animal
    if (formAnimal) {
        formAnimal.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!fotoInput.files || fotoInput.files.length === 0) {
                alert('Atenção: É obrigatório anexar uma foto do pet.');
                return;
            }

            const file = fotoInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `pets/${fileName}`;

            try {
                // Upload para o Bucket
                const { error: uploadError } = await _supabase
                    .storage
                    .from('fotos-animais')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Obter URL pública
                const { data: urlData } = _supabase
                    .storage
                    .from('fotos-animais')
                    .getPublicUrl(filePath);

                // Inserir registro vinculado ao ID do usuário autenticado
                const novoAnimal = {
                    doador_id: usuarioLogado.id, // ID extraído da sessão ativa
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

                alert('Animal cadastrado com sucesso!');
                formAnimal.reset();

            } catch (err) {
                alert('Erro no cadastro: ' + err.message);
            }
        });
    }
});

// Botão opcional de Sair (Logout)
async function fazerLogout() {
    await _supabase.auth.signOut();
    window.location.href = 'login.html';
}