// Configurações do Plano
const phases = [
    { day: 1, title: "Fase 1: Fundação", instruction: "Foco: entender seus gatilhos e âncoras matinais. Estabeleça rotinas consistentes.", tasks: ["Acordar no horário", "5 min de planejamento", "1 tarefa importante (Deep Work)", "Celular Modo Foco (8h-12h)"] },
    { day: 31, title: "Fase 2: Compromisso", instruction: "Foco: aumentar intensidade e exercício físico. Consolidar os hábitos.", tasks: ["30 min Exercício", "10 min Meditação/Leitura", "3h Foco Profundo", "Ritual Noturno (Telas OFF)"] },
    { day: 61, title: "Fase 3: Identidade", instruction: "Foco: manter o sistema e agir como quem você se tornou. Transformação permanente.", tasks: ["Prioridades da Semana OK", "Revisão Diária", "Voto de Identidade", "Recompensa Atrasada"] }
];

const tips = [
    "Remova o celular do quarto ao dormir.",
    "Beba 2 litros de água diariamente.",
    "Faça uma caminhada de 10 minutos após acordar.",
    "Escreva 3 coisas que você é grato.",
    "Estude por 30 minutos antes do almoço.",
    "Organize seu espaço de trabalho.",
    "Faça uma revisão das metas antes de dormir.",
    "Pratique respiração profunda por 5 minutos.",
    "Leia 10 páginas de um livro motivacional.",
    "Evite redes sociais nas primeiras 2 horas do dia."
];

let state = JSON.parse(localStorage.getItem('disciplina90D')) || {
    startDate: new Date().toISOString(),
    completedDays: {},
    journalEntries: {}
};

function getDayCount() {
    const start = new Date(state.startDate);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diff, 1), 90);
}

function getCompletionStats() {
    const completedCount = Object.keys(state.completedDays).filter(date => {
        return state.completedDays[date].length > 0;
    }).length;
    
    const day = getDayCount();
    const rate = Math.round((completedCount / day) * 100);
    
    return { completedCount, rate };
}

function updateUI() {
    const day = getDayCount();
    const phase = [...phases].reverse().find(p => day >= p.day);
    
    document.getElementById('days-count').innerText = `Dia ${day.toString().padStart(2, '0')}/90`;
    document.getElementById('progress-bar').style.width = `${(day/90)*100}%`;
    document.getElementById('current-phase').innerText = phase.title;
    document.getElementById('phase-instruction').innerText = phase.instruction;

    // Atualizar estatísticas
    const stats = getCompletionStats();
    document.getElementById('completed-days').innerText = stats.completedCount;
    document.getElementById('completion-rate').innerText = stats.rate + '%';

    const taskContainer = document.getElementById('daily-tasks');
    taskContainer.innerHTML = '';
    
    const todayKey = new Date().toLocaleDateString();
    const todayTasks = state.completedDays[todayKey] || [];

    phase.tasks.forEach(task => {
        const checked = todayTasks.includes(task) ? 'checked' : '';
        taskContainer.innerHTML += `
            <label class="flex items-center space-x-3 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                <input type="checkbox" class="w-5 h-5 accent-blue-500" ${checked} onchange="toggleTask('${task}')">
                <span class="text-sm ${checked ? 'line-through text-slate-500' : ''}">${task}</span>
            </label>
        `;
    });

    // Dica do dia
    const dayIndex = (day - 1) % tips.length;
    document.getElementById('daily-tip').innerText = tips[dayIndex];

    document.getElementById('journal').value = state.journalEntries[todayKey] || '';
}

function toggleTask(task) {
    const todayKey = new Date().toLocaleDateString();
    if (!state.completedDays[todayKey]) state.completedDays[todayKey] = [];
    
    const index = state.completedDays[todayKey].indexOf(task);
    if (index > -1) {
        state.completedDays[todayKey].splice(index, 1);
    } else {
        state.completedDays[todayKey].push(task);
    }
    save();
    updateUI();
}

function saveJournal() {
    const todayKey = new Date().toLocaleDateString();
    state.journalEntries[todayKey] = document.getElementById('journal').value;
    save();
    alert("✅ Reflexão salva com sucesso!");
}

function save() {
    localStorage.setItem('disciplina90D', JSON.stringify(state));
}

function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `disciplina90D-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    alert("📥 Dados exportados com sucesso!");
}

function resetProgress() {
    if(confirm("⚠️ Deseja realmente resetar seu progresso de 90 dias? Esta ação não pode ser desfeita!")) {
        state = {
            startDate: new Date().toISOString(),
            completedDays: {},
            journalEntries: {}
        };
        save();
        updateUI();
        alert("🔄 Progresso resetado. Novo ciclo iniciado!");
    }
}

// Inicializar interface
updateUI();

// Atualizar cada minuto para sincronizar dia
setInterval(updateUI, 60000);