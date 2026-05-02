const STORAGE_KEY = 'tasks_v1';

let tasks = load();
let currentFilter = 'all';

const taskInput    = document.getElementById('task-input');
const addBtn       = document.getElementById('add-btn');
const taskList     = document.getElementById('task-list');
const emptyState   = document.getElementById('empty-state');
const footer       = document.getElementById('footer');
const doneCount    = document.getElementById('done-count');
const clearDoneBtn = document.getElementById('clear-done-btn');
const subtitle     = document.getElementById('subtitle');

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) { taskInput.focus(); return; }
  tasks.unshift({ id: Date.now(), text, done: false });
  save();
  render();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) { task.done = !task.done; save(); render(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
}

function filteredTasks() {
  if (currentFilter === 'pending') return tasks.filter(t => !t.done);
  if (currentFilter === 'done')    return tasks.filter(t => t.done);
  return tasks;
}

function render() {
  const visible       = filteredTasks();
  const pendingCount  = tasks.filter(t => !t.done).length;
  const completedCount = tasks.filter(t => t.done).length;

  subtitle.textContent = pendingCount === 1
    ? '1 tarefa pendente'
    : `${pendingCount} tarefas pendentes`;

  taskList.innerHTML = '';

  emptyState.hidden = visible.length > 0;

  visible.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', task.done ? 'Marcar como pendente' : 'Marcar como concluída');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.setAttribute('aria-label', 'Remover tarefa');
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"></path>
      <path d="M10 11v6M14 11v6"></path>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"></path>
    </svg>`;
    btn.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, span, btn);
    taskList.appendChild(li);
  });

  footer.hidden = tasks.length === 0;
  if (tasks.length > 0) {
    doneCount.textContent = completedCount === 1 ? '1 concluída' : `${completedCount} concluídas`;
    clearDoneBtn.hidden = completedCount === 0;
  }
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

clearDoneBtn.addEventListener('click', clearDone);

render();
