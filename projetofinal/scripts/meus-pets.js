// =========================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// =========================================================
const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let usuarioLogado = null;
let meusPetsCache = [];

// =========================================================
// INICIALIZAÇÃO DA PÁGINA
// =========================================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar Autenticação
    const { data: { session } } = await _supabase.auth.getSession();

    if (!session) {
        alert('Sessão expirada ou não encontrada. Faça login para gerenciar seus pets.');
        window.location.href = 'login.html';
        return;
    }

    usuarioLogado = session.user;

    const userEmailNav = document.getElementById('userEmailNav');
    if (userEmailNav) userEmailNav.textContent = usuarioLogado.email;

    // Botão Sair
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', async () => {
            if (confirm('Deseja realmente sair?')) {
                await _supabase.auth.signOut();
                window.location.href = 'login.html';
            }
        });
    }

    // Eventos do Modal de Candidatos (Fechamento)
    const btnFecharCandidatos = document.getElementById('btnFecharModal');
    const modalCandidatos = document.getElementById('modalCandidatos');

    btnFecharCandidatos?.addEventListener('click', () => {
        if (modalCandidatos) modalCandidatos.style.display = 'none';
    });
    
    modalCandidatos?.addEventListener('click', (e) => {
        if (e.target === modalCandidatos) modalCandidatos.style.display = 'none';
    });

    // 2. Carregar Lista de Pets
    await carregarMeusPets();

    // 3. Configurar Eventos dos Modais e da Grid
    configurarEventosModal();
    configurarEventosGrid();
});

// =========================================================
// MODAL DE CANDIDATOS (ESCOPO GLOBAL PARA FUNCIONAR NO ONCLICK)
// =========================================================
async function abrirCandidatosPet(petId, nomePet) {
    const modal = document.getElementById('modalCandidatos');
    const container = document.getElementById('containerCandidatos');
    const titulo = document.getElementById('modalTituloPet');

    if (!modal || !container) {
        console.error('Elementos do modal de candidatos não foram encontrados no HTML.');
        return;
    }

    if (titulo) titulo.innerText = `Candidatos para: ${nomePet}`;
    container.innerHTML = '<p class="loading-text">Carregando candidatos...</p>';
    modal.style.display = 'flex';

    try {
        const { data: candidatos, error } = await _supabase
            .from('candidatos')
            .select('*')
            .eq('pet_id', petId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!candidatos || candidatos.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma ficha enviada para este pet ainda.</p>';
            return;
        }

        renderizarListaCandidatos(candidatos, container);

    } catch (err) {
        console.error('Erro ao buscar candidatos:', err);
        container.innerHTML = '<p class="error-text">Erro ao carregar candidatos.</p>';
    }
}

function renderizarListaCandidatos(candidatos, container) {
    container.innerHTML = candidatos.map(c => {
        const dataEnvio = new Date(c.created_at).toLocaleDateString('pt-BR');
        
        let detalheMoradia = `Residência ${(c.tipo_residencia || '').toUpperCase()} (${c.situacao_residencia || 'N/I'})`;
        if (c.tipo_residencia === 'apto') {
            detalheMoradia += ` | Telado: ${c.janelas_teladas === 'sim' ? 'Sim' : 'Não/Parcial'}`;
        } else if (c.tipo_residencia === 'casa') {
            detalheMoradia += ` | Cercada: ${c.casa_cercada === 'sim' ? 'Sim' : 'Não/Parcial'}`;
        }

        let detalhePets = c.teve_animais === 'sim' 
            ? `${c.quais_e_quantos || 'Sim'} (Castrados: ${c.sao_castrados || 'N/I'}, Vacinados: ${c.sao_vacinados || 'N/I'})` 
            : 'Primeiro animal';

        return `
            <div class="candidato-card">
                <div class="candidato-header">
                    <h4>${c.nome}</h4>
                    <span class="candidato-data">Enviado em: ${dataEnvio}</span>
                </div>
                <div class="candidato-grid">
                    <p><strong>Cidade/Bairro:</strong> ${c.cidade || ''} - ${c.bairro || ''}</p>
                    <p><strong>Profissão:</strong> ${c.profissao || ''} (${c.local_trabalho || ''})</p>
                    <p><strong>Estado Civil:</strong> ${c.estado_civil || ''} ${c.nome_conjuge ? `(Cônjuge: ${c.nome_conjuge})` : ''}</p>
                    <p><strong>Tempo no local:</strong> ${c.tempo_residencia || ''}</p>
                    <p style="grid-column: span 2;"><strong>Moradia:</strong> ${detalheMoradia}</p>
                    <p style="grid-column: span 2;"><strong>Histórico Pets:</strong> ${detalhePets}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Explicitando a inclusão das funções na janela global
window.abrirCandidatosPet = abrirCandidatosPet;
window.renderizarListaCandidatos = renderizarListaCandidatos;

// =========================================================
// FILTRO E GRID DE PETS
// =========================================================
async function carregarMeusPets() {
    const gridContainer = document.getElementById('gridMeusPets');

    try {
        const { data: pets, error } = await _supabase
            .from('animais')
            .select('*')
            .eq('doador_id', usuarioLogado.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        meusPetsCache = pets || [];

        if (meusPetsCache.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                    <p style="font-size: 1.1rem; color: #64748b; margin-bottom: 1rem;">Você ainda não possui nenhum pet cadastrado para doação.</p>
                    <a href="cadastro.html" class="btn btn-primary">+ Cadastrar Primeiro Pet</a>
                </div>
            `;
            return;
        }

        renderizarGridPets(meusPetsCache);

    } catch (err) {
        console.error('Erro ao buscar pets do doador:', err);
        gridContainer.innerHTML = `<p style="grid-column: 1 / -1; color: #ef4444; text-align: center;">Erro ao carregar dados: ${err.message}</p>`;
    }
}

function renderizarGridPets(pets) {
    const gridContainer = document.getElementById('gridMeusPets');
    gridContainer.innerHTML = '';

    pets.forEach(pet => {
        let classeStatus = 'status-disponivel';
        if (pet.status === 'Em Processo') classeStatus = 'status-processo';
        if (pet.status === 'Adotado') classeStatus = 'status-adotado';

        const cardHtml = `
            <div class="pet-card-doador">
                <div class="pet-card-img-wrapper">
                    <img src="${pet.url_foto}" alt="${pet.nome}">
                    <span class="badge-status ${classeStatus}">${pet.status || 'Disponível'}</span>
                </div>
                <div class="pet-card-body">
                    <h3 style="margin-bottom: 0.25rem;">${pet.nome}</h3>
                    <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">
                        ${pet.especie} • ${pet.porte} • ${pet.idade}
                    </p>
                    <p style="font-size: 0.875rem; color: #334155; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${pet.descricao}
                    </p>
                    <div class="pet-card-actions">
                        <button class="btn btn-secondary btn-editar-pet" style="flex: 1;" data-id="${pet.id}">✏️ Editar</button>
                        <button class="btn btn-secondary btn-excluir-pet" style="color: #ef4444; border-color: #fee2e2;" data-id="${pet.id}" data-nome="${pet.nome}">🗑️ Excluir</button>
                        <button class="btn-candidatos-count" onclick="abrirCandidatosPet(${pet.id}, '${pet.nome.replace(/'/g, "\\'")}')">📋 Ver Candidatos Recebidos</button>
                    </div>
                </div>
            </div>
        `;
        gridContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// =========================================================
// EVENTOS DO GRID (EDITAR / EXCLUIR)
// =========================================================
function configurarEventosGrid() {
    const gridContainer = document.getElementById('gridMeusPets');
    if (!gridContainer) return;

    gridContainer.addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.btn-editar-pet');
        const btnExcluir = e.target.closest('.btn-excluir-pet');

        if (btnEditar) {
            const petId = btnEditar.getAttribute('data-id');
            abrirModalEdicao(petId);
        }

        if (btnExcluir) {
            const petId = btnExcluir.getAttribute('data-id');
            const petNome = btnExcluir.getAttribute('data-nome');
            await excluirPet(petId, petNome);
        }
    });
}

// =========================================================
// EDIÇÃO DE PETS
// =========================================================
const modalEdicao = document.getElementById('modalEdicao');

function abrirModalEdicao(idPet) {
    const pet = meusPetsCache.find(p => String(p.id) === String(idPet));
    if (!pet) return;

    document.getElementById('editPetId').value = pet.id;
    document.getElementById('editFotoPreview').src = pet.url_foto;
    document.getElementById('editAnimalStatus').value = pet.status || 'Disponível';
    document.getElementById('editAnimalNome').value = pet.nome;
    document.getElementById('editAnimalEspecie').value = pet.especie;
    document.getElementById('editAnimalPorte').value = pet.porte;
    document.getElementById('editAnimalIdade').value = pet.idade;
    document.getElementById('editAnimalDescricao').value = pet.descricao;

    document.getElementById('editAnimalFoto').value = '';

    if (modalEdicao) modalEdicao.style.display = 'flex';
}

function fecharModal() {
    if (modalEdicao) modalEdicao.style.display = 'none';
}

function configurarEventosModal() {
    const btnFechar = document.getElementById('btnFecharModal');
    const btnCancelar = document.getElementById('btnCancelarEdicao');

    if (btnFechar) btnFechar.addEventListener('click', fecharModal);
    if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);

    const fileInput = document.getElementById('editAnimalFoto');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('editFotoPreview').src = event.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    const formEdicao = document.getElementById('formEdicaoPet');
    if (formEdicao) {
        formEdicao.addEventListener('submit', async (e) => {
            e.preventDefault();

            const petId = document.getElementById('editPetId').value;
            const btnSalvar = document.getElementById('btnSalvarEdicao');
            const fileInput = document.getElementById('editAnimalFoto');

            try {
                btnSalvar.disabled = true;
                btnSalvar.textContent = 'Salvando...';

                let novaUrlFoto = null;

                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    const fileExt = file.name.split('.').pop().toLowerCase();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
                    const filePath = `pets/${fileName}`;

                    const { error: uploadError } = await _supabase.storage
                        .from('fotos-animais')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: urlData } = _supabase.storage
                        .from('fotos-animais')
                        .getPublicUrl(filePath);

                    novaUrlFoto = urlData.publicUrl;
                }

                const dadosAtualizados = {
                    nome: document.getElementById('editAnimalNome').value.trim(),
                    status: document.getElementById('editAnimalStatus').value,
                    especie: document.getElementById('editAnimalEspecie').value,
                    porte: document.getElementById('editAnimalPorte').value,
                    idade: document.getElementById('editAnimalIdade').value.trim(),
                    descricao: document.getElementById('editAnimalDescricao').value.trim()
                };

                if (novaUrlFoto) {
                    dadosAtualizados.url_foto = novaUrlFoto;
                }

                const { error: dbError } = await _supabase
                    .from('animais')
                    .update(dadosAtualizados)
                    .eq('id', petId)
                    .eq('doador_id', usuarioLogado.id);

                if (dbError) throw dbError;

                alert('✅ Informações do pet atualizadas com sucesso!');
                fecharModal();
                await carregarMeusPets();

            } catch (err) {
                console.error('Erro ao atualizar pet:', err);
                alert('Erro ao salvar alterações: ' + err.message);
            } finally {
                btnSalvar.disabled = false;
                btnSalvar.textContent = 'Salvar Alterações';
            }
        });
    }
}

// =========================================================
// EXCLUIR PET
// =========================================================
async function excluirPet(idPet, nomePet) {
    const confirmou = confirm(`Tem certeza que deseja excluir o anúncio de "${nomePet}"? Esta ação não poderá ser desfeita.`);
    if (!confirmou) return;

    try {
        const { error } = await _supabase
            .from('animais')
            .delete()
            .eq('id', idPet)
            .eq('doador_id', usuarioLogado.id);

        if (error) throw error;

        alert('🗑️ Anúncio removido com sucesso!');
        await carregarMeusPets();

    } catch (err) {
        console.error('Erro ao excluir pet:', err);
        alert('Erro ao excluir pet: ' + err.message);
    }
}