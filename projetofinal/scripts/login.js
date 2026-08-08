// scripts/login.js

const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let modoCadastro = false;

document.addEventListener('DOMContentLoaded', () => {
    const linkAlternar = document.getElementById('linkAlternar');
    const formAuth = document.getElementById('formAuth');

    // altera entre tela de Login e tela de Cadastro
    // problemas encontrados quando logava e alterava os dados da localidade
    if (linkAlternar) {
        linkAlternar.addEventListener('click', (e) => {
            e.preventDefault();
            modoCadastro = !modoCadastro;
            alternarModoFormulario();
        });
    }

    // Submissão do formulário
    if (formAuth) {
        formAuth.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (modoCadastro) {
                await realizarCadastro();
            } else {
                await realizarLogin();
            }
        });
    }
});

function alternarModoFormulario() {
    const titulo = document.getElementById('tituloForm');
    const subtitulo = document.getElementById('subtituloForm');
    const btnSubmit = document.getElementById('btnSubmit');
    const textoAlternar = document.getElementById('textoAlternar');
    const camposCadastro = document.querySelectorAll('.campo-cadastro');

    if (modoCadastro) {
        titulo.innerText = 'Criar Nova Conta';
        subtitulo.innerText = 'Preencha seus dados de doador para cadastrar pets.';
        btnSubmit.innerText = 'Cadastrar Conta';
        textoAlternar.innerHTML = 'Já possui uma conta? <a href="#" id="linkAlternar">Acesse aqui</a>';
        
        // Exibe campos adicionais e torna obrigatórios
        camposCadastro.forEach(el => el.style.display = 'block');
        document.getElementById('nomeDoador').required = true;
        document.getElementById('whatsapp').required = true;
        document.getElementById('localizacao').required = true;
    } else {
        titulo.innerText = 'Acessar Área do Doador';
        subtitulo.innerText = 'Entre com seus dados para gerenciar cadastros de pets.';
        btnSubmit.innerText = 'Entrar';
        textoAlternar.innerHTML = 'Ainda não tem conta? <a href="#" id="linkAlternar">Cadastre-se aqui</a>';

        // Esconde campos adicionais e remove obrigatoriedade
        camposCadastro.forEach(el => el.style.display = 'none');
        document.getElementById('nomeDoador').required = false;
        document.getElementById('whatsapp').required = false;
        document.getElementById('localizacao').required = false;
    }

    // Reassocia o evento de clique no link recém-recriado
    document.getElementById('linkAlternar').addEventListener('click', (e) => {
        e.preventDefault();
        modoCadastro = !modoCadastro;
        alternarModoFormulario();
    });
}

// ********************************************************
// 1. Login site
// ******************************************************
async function realizarLogin() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) throw error;

        alert('Login realizado com sucesso!');
        window.location.href = 'index.html';

    } catch (err) {
        console.error('Erro no login:', err);
        alert('Erro ao realizar login: ' + err.message);
    }
}

// ********************************************************
// 2. Cadastro (Cria usuário AUTH grava perfil completo)
// ****************************************************
async function realizarCadastro() {
    const nome = document.getElementById('nomeDoador').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const localizacao = document.getElementById('localizacao').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
        // Step 1: Cria a conta de autenticação no Supabase Auth
        const { data: authData, error: authError } = await _supabase.auth.signUp({
            email: email,
            password: senha
        });

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) {
            throw new Error('Não foi possível obter o ID do novo usuário.');
        }

        // Step 2: Cria o registro na tabela profiles com *TODOS* os campos
        const { error: profileError } = await _supabase
            .from('profiles')
            .insert([
                {
                    id: userId,
                    nome: nome,
                    whatsapp: whatsapp,
                    localizacao: localizacao,
                    email: email,
                    tipo: 'doador'
                }
            ]);

        if (profileError) throw profileError;

        alert('Conta criada com sucesso!');
        window.location.href = 'index.html';

    } catch (err) {
        console.error('Erro no cadastro:', err);
        alert('Erro ao cadastrar conta: ' + err.message);
    }
}