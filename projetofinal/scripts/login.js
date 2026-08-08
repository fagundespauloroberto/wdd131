// =========================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// =========================================================
const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let modoCadastro = false;

document.addEventListener('DOMContentLoaded', () => {
    const formAuth = document.getElementById('formAuth');
    const grupoNome = document.getElementById('grupoNome');
    const grupoTipo = document.getElementById('grupoTipo');
    const grupoLocalizacao = document.getElementById('grupoLocalizacao');
    const grupoWhatsapp = document.getElementById('grupoWhatsapp');
    
    const inputNome = document.getElementById('nomeDoador');
    const selectTipo = document.getElementById('cadTipo');
    const inputLocalizacao = document.getElementById('cadLocalizacao');
    const inputWhatsapp = document.getElementById('whatsappDoador');

    const tituloForm = document.getElementById('tituloForm');
    const subtituloForm = document.getElementById('subtituloForm');
    const btnSubmit = document.getElementById('btnSubmit');
    const textoAlternar = document.getElementById('textoAlternar');

    // Função para alternar a interface entre Login e Cadastro
    function alternarModo() {
        modoCadastro = !modoCadastro;

        if (modoCadastro) {
            tituloForm.textContent = 'Criar Conta de Doador';
            subtituloForm.textContent = 'Preencha os dados abaixo para publicar anúncios de adoção.';
            
            // Exibir campos de cadastro
            if (grupoNome) grupoNome.style.display = 'block';
            if (grupoTipo) grupoTipo.style.display = 'block';
            if (grupoLocalizacao) grupoLocalizacao.style.display = 'block';
            if (grupoWhatsapp) grupoWhatsapp.style.display = 'block';

            // Definir obrigatoriedade dos campos
            if (inputNome) inputNome.required = true;
            if (selectTipo) selectTipo.required = true;
            if (inputLocalizacao) inputLocalizacao.required = true;
            if (inputWhatsapp) inputWhatsapp.required = true;

            btnSubmit.textContent = 'Cadastrar Conta';
            textoAlternar.innerHTML = 'Já possui conta? <a href="#" id="linkAlternar">Acesse aqui</a>';
        } else {
            tituloForm.textContent = 'Acessar Área do Doador';
            subtituloForm.textContent = 'Entre com seus dados para gerenciar cadastros de pets.';
            
            // Ocultar campos de cadastro
            if (grupoNome) grupoNome.style.display = 'none';
            if (grupoTipo) grupoTipo.style.display = 'none';
            if (grupoLocalizacao) grupoLocalizacao.style.display = 'none';
            if (grupoWhatsapp) grupoWhatsapp.style.display = 'none';

            // Remover obrigatoriedade dos campos ocultos
            if (inputNome) inputNome.required = false;
            if (selectTipo) selectTipo.required = false;
            if (inputLocalizacao) inputLocalizacao.required = false;
            if (inputWhatsapp) inputWhatsapp.required = false;

            btnSubmit.textContent = 'Entrar';
            textoAlternar.innerHTML = 'Ainda não tem conta? <a href="#" id="linkAlternar">Cadastre-se aqui</a>';
        }
    }

    // Event listener usando delegação para tratar o link de alternar modo
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'linkAlternar') {
            e.preventDefault();
            alternarModo();
        }
    });

    // Submissão do formulário
    if (formAuth) {
        formAuth.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;

            btnSubmit.disabled = true;

            try {
                if (modoCadastro) {
                    const nome = inputNome.value.trim();
                    const tipo = selectTipo.value;
                    const localizacao = inputLocalizacao.value.trim();
                    const whatsapp = inputWhatsapp.value.trim();

                    if (!nome || !tipo || !localizacao || !whatsapp) {
                        alert('Por favor, preencha todos os campos obrigatórios para o cadastro.');
                        btnSubmit.disabled = false;
                        return;
                    }

                    btnSubmit.textContent = 'Criando conta...';

                    // 1. Cria novo usuário no Supabase Auth e salva metadados
                    const { data: authData, error: authError } = await _supabase.auth.signUp({
                        email,
                        password: senha,
                        options: {
                            data: {
                                nome_doador: nome,
                                tipo: tipo,
                                localizacao: localizacao,
                                whatsapp: whatsapp
                            }
                        }
                    });

                    if (authError) throw authError;

                    // 2. Se a conta foi criada e possuir ID de usuário (sessão criada)
                    if (authData?.user) {
                        const { error: profileError } = await _supabase.from('profiles').upsert({
                            id: authData.user.id,
                            nome: nome,
                            email: email,
                            whatsapp: whatsapp,
                            localizacao: localizacao,
                            tipo: tipo
                        }, { onConflict: 'id' });

                        if (profileError) {
                            console.warn('Aviso ao registrar na tabela profiles:', profileError.message);
                        }
                    }

                    alert('Conta criada com sucesso!');
                    window.location.href = 'cadastro.html';

                } else {
                    btnSubmit.textContent = 'Entrando...';

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
                console.error('Erro de autenticação:', err);
                alert('Erro de Autenticação: ' + err.message);
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = modoCadastro ? 'Cadastrar Conta' : 'Entrar';
            }
        });
    }
});