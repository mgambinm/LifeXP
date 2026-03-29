// 1. VARIABLES DE ESTADO (Cargar datos o valores iniciales)
let nivelActual = parseInt(localStorage.getItem('nivel')) || 1;
let xpActual = parseInt(localStorage.getItem('xp')) || 0;
let xpNecesaria = parseInt(localStorage.getItem('meta')) || 100;
let tareasGuardadas = JSON.parse(localStorage.getItem('tareas')) || [];

// 2. SELECCIÓN DE ELEMENTOS HTML
const btnAdd = document.getElementById('add-btn');
const inputTask = document.getElementById('task-input');
const selectDifficulty = document.getElementById('difficulty');
const taskList = document.getElementById('task-list');
const elLevel = document.getElementById('level');
const elXP = document.getElementById('current-xp');
const elProgressBar = document.getElementById('progress-bar');
const btnReset = document.getElementById('reset-btn');

// --- 3. FUNCIONES DE PERSISTENCIA (GUARDADO) ---

function guardarTodo() {
    localStorage.setItem('nivel', nivelActual);
    localStorage.setItem('xp', xpActual);
    localStorage.setItem('meta', xpNecesaria);
    
    const todasLasTareas = [];
    document.querySelectorAll('#task-list li').forEach(li => {
        todasLasTareas.push({
            texto: li.querySelector('span').innerText.split(' (+')[0],
            puntos: li.dataset.puntos
        });
    });
    localStorage.setItem('tareas', JSON.stringify(todasLasTareas));
}

function cargarTareasPrevias() {
    tareasGuardadas.forEach(t => crearElementoTarea(t.texto, t.puntos));
    actualizarInterfaz();
}

// --- 4. LÓGICA DE TAREAS ---

function crearElementoTarea(texto, puntos) {
    const nuevaTarea = document.createElement('li');
    nuevaTarea.dataset.puntos = puntos; 
    
    nuevaTarea.innerHTML = `
        <span>${texto} (<strong>+${puntos} XP</strong>)</span>
        <div>
            <button class="btn-complete">✅</button>
            <button class="btn-delete">🗑️</button>
        </div>
    `;

    taskList.appendChild(nuevaTarea);

    // Botón borrar
    nuevaTarea.querySelector('.btn-delete').onclick = () => {
        nuevaTarea.remove();
        guardarTodo();
    };

    // Botón completar
    nuevaTarea.querySelector('.btn-complete').onclick = () => {
        const sonidoTarea = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
        sonidoTarea.volume = 0.5; // Lo ponemos un poco más bajo que el de nivel para que no asuste
        sonidoTarea.play();

        ganarXP(parseInt(puntos));
        nuevaTarea.remove();
        guardarTodo();
    };
}

// Evento para el botón de Añadir
btnAdd.addEventListener('click', () => {
    const texto = inputTask.value;
    const puntos = selectDifficulty.value;
    if (texto === "") return alert("¡Escribe algo primero!");

    crearElementoTarea(texto, puntos);
    inputTask.value = "";
    guardarTodo();
});

// --- 5. SISTEMA DE JUEGO Y SONIDO ---

function ganarXP(puntos) {
    xpActual += puntos;

    if (xpActual >= xpNecesaria) {
        nivelActual++;
        xpActual = xpActual - xpNecesaria; 
        xpNecesaria = Math.round(xpNecesaria * 1.2);

        // Sonido de subida de nivel
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        audio.play();

        alert(`¡LEVEL UP! Ahora eres nivel ${nivelActual}. Siguiente meta: ${xpNecesaria} XP`);
    }
    actualizarInterfaz();
    guardarTodo();
}

function actualizarInterfaz() {
    elLevel.innerText = nivelActual;
    elXP.innerText = xpActual;
    
    // Actualizamos el texto de la XP meta
    const statsContainer = document.querySelector('.stats-container p:last-child');
    if (statsContainer) {
        statsContainer.innerHTML = `XP: <span id="current-xp">${xpActual}</span> / ${xpNecesaria}`;
    }

    // Actualizamos barra visual
    const porcentaje = (xpActual / xpNecesaria) * 100;
    elProgressBar.style.width = porcentaje + "%";
}

// --- 6. BOTÓN REINICIAR ---

if (btnReset) {
    btnReset.addEventListener('click', () => {
        const confirmar = confirm("¿Estás seguro de que quieres borrar TODO tu progreso? Esta acción no se puede deshacer.");
        if (confirmar) {
            localStorage.clear();
            location.reload(); 
        }
    });
}

// INICIO: Cargar todo al abrir
cargarTareasPrevias();