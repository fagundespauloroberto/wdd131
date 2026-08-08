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
    const metadata = usuarioLogado.user_metadata || {};

    const nomeDoador = metadata.nome_doador || usuarioLogado.email;
    const whatsappDoador = metadata.whatsapp || 'Não informado';
    const localizacaoDoador = metadata.localizacao || 'Não informada';
    const tipoDoador = metadata.tipo || 'Doador Particular';
    const emailDoador = usuarioLogado.email;

    // Exibir dados do usuário no menu e na interface
    const userEmailNav = document.getElementById('userEmailNav');
    if (userEmailNav) userEmailNav.textContent = emailDoador;

    const elDoador = document.getElementById('nomeDoadorLogado');
    if (elDoador) elDoador.textContent = nomeDoador;

    // 2. Lógica do Botão Sair (Logout)
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', async () => {
            const confirmou = confirm('Deseja realmente encerrar a sessão?');
            if (confirmou) {
                const { error } = await _supabase.auth.signOut();
                if (error) {
                    alert('Erro ao sair: ' + error.message);
                } else {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    // 3. Garantir/Sincronizar perfil completo na tabela 'profiles'
    try {
        const { error: profileError } = await _supabase.from('profiles').upsert({
            id: usuarioLogado.id,
            nome: nomeDoador,
            email: emailDoador,
            whatsapp: whatsappDoador,
            localizacao: localizacaoDoador,
            tipo: tipoDoador
        }, { onConflict: 'id' });

        if (profileError) {
            console.warn('Aviso ao sincronizar perfil:', profileError.message);
        }
    } catch (errPerfil) {
        console.error('Erro ao salvar dados em profiles:', errPerfil);
    }

    // 4. Manipular o envio do formulário de cadastro do pet
    const formAnimal = document.getElementById('formAnimal');
    if (formAnimal) {
        formAnimal.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = formAnimal.querySelector('button[type="submit"]');
            const fotoInput = document.getElementById('animalFoto');

            if (!fotoInput.files || fotoInput.files.length === 0) {
                alert('Por favor, selecione uma foto do pet.');
                return;
            }

            try {
                // Bloqueia o botão para evitar envio duplo
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Cadastrando...';
                }

                // Upload da Imagem
                const file = fotoInput.files[0];
                const fileExt = file.name.split('.').pop().toLowerCase();
                const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
                const filePath = `pets/${fileName}`;

                const { error: uploadError } = await _supabase.storage
                    .from('fotos-animais')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = _supabase.storage
                    .from('fotos-animais')
                    .getPublicUrl(filePath);

                // Preparar objeto do animal
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
            } finally {
                // Reabilita o botão
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Cadastrar Pet para Doação';
                }
            }
        });
    }
});