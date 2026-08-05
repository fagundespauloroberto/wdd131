const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let modoCadastro = false;

document.addEventListener('DOMContentLoaded', () => {
    const formAuth = document.getElementById('formAuth');
    const linkAlternar = document.getElementById('linkAlternar');
    const grupoNome = document.getElementById('grupoNome');
    const grupoWhatsapp = document.getElementById('grupoWhatsapp');
    const tituloForm = document.getElementById('tituloForm');
    const subtituloForm = document.getElementById('subtituloForm');
    const btnSubmit = document.getElementById('btnSubmit');
    const textoAlternar = document.getElementById('textoAlternar');

    // Alterna a interface entre Login e Cadastro
    linkAlternar.addEventListener('click', (e) => {
        e.preventDefault();
        modoCadastro = !modoCadastro;

        if (modoCadastro) {
            tituloForm.textContent = 'Criar Conta de Doador';
            subtituloForm.textContent = 'Preencha os dados abaixo para publicar anúncios de adoção.';
            grupoNome.style.display = 'block';
            grupoWhatsapp.style.display = 'block';
            btnSubmit.textContent = 'Cadastrar Conta';
            textoAlternar.innerHTML = 'Já possui conta? <a href="#" id="linkAlternar">Acesse aqui</a>';
        } else {
            tituloForm.textContent = 'Acessar Área do Doador';
            subtituloForm.textContent = 'Entre com seus dados para gerenciar cadastros de pets.';
            grupoNome.style.display = 'none';
            grupoWhatsapp.style.display = 'none';
            btnSubmit.textContent = 'Entrar';
            textoAlternar.innerHTML = 'Ainda não tem conta? <a href="#" id="linkAlternar">Cadastre-se aqui</a>';
        }
        
        // Re-vincula o evento do novo link criado
        document.getElementById('linkAlternar').addEventListener('click', arguments.callee);
    });

    // Submissão do formulário
    formAuth.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;

        try {
            if (modoCadastro) {
                const nome = document.getElementById('nomeDoador').value.trim();
                const whatsapp = document.getElementById('whatsappDoador').value.trim();

                if (!nome || !whatsapp) {
                    alert('Por favor, preencha nome e WhatsApp.');
                    return;
                }

                // Cria novo usuário e salva metadados no Supabase Auth
                const { data, error } = await _supabase.auth.signUp({
                    email,
                    password: senha,
                    options: {
                        data: {
                            nome_doador: nome,
                            whatsapp: whatsapp
                        }
                    }
                });

                if (error) throw error;

                alert('Conta criada com sucesso! Você será redirecionado.');
                window.location.href = 'cadastro.html';

            } else {
                // Realiza Login
                const { data, error } = await _supabase.auth.signInWithPassword({
                    email,
                    password: senha
                });

                if (error) throw error;

                alert('Login efetuado com sucesso!');
                window.location.href = 'cadastro.html';
            }
        } catch (err) {
            alert('Erro de Autenticação: ' + err.message);
        }
    });
});