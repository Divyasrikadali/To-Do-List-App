const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const categoryInput = document.getElementById('categoryInput');
const levelInput = document.getElementById('levelInput');
const searchInput = document.getElementById('searchInput');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
let isDarkMode = false;
let filter = 'all';
let draggedItem = null;

document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme === 'true') { document.body.classList.add('dark-mode'); isDarkMode = true; }
  updateProgress();
});

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
}

function addTask() {
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const category = categoryInput.value;
  const level = levelInput.value;
  if (!text) return;
  const li = createTaskElement(text, dueDate, category, level, false);
  taskList.appendChild(li);
  saveTasks();
  taskInput.value = '';
  dueDateInput.value = '';
  updateProgress();
}

function createTaskElement(text, dueDate, category, level, pinned) {
  const li = document.createElement('li');
  li.setAttribute('draggable', true);
  if (pinned) li.classList.add('pinned');

  const span = document.createElement('span');
  span.textContent = text;
  span.onclick = () => { li.classList.toggle('completed'); saveTasks(); updateProgress(); };

  const tags = document.createElement('div');
  tags.classList.add('tags');
  const catTag = document.createElement('span');
  catTag.textContent = category;
  catTag.classList.add('tag', category);
  const lvlTag = document.createElement('span');
  lvlTag.textContent = level;
  lvlTag.classList.add('tag', level);
  tags.appendChild(catTag);
  tags.appendChild(lvlTag);

  if (dueDate) {
    const dueSpan = document.createElement('small');
    dueSpan.textContent = "Due: " + new Date(dueDate).toLocaleString();
    tags.appendChild(dueSpan);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '×';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.onclick = () => { li.remove(); saveTasks(); updateProgress(); };

  const pinBtn = document.createElement('button');
  pinBtn.textContent = '📌';
  pinBtn.classList.add('pin-btn');
  pinBtn.onclick = () => { li.classList.toggle('pinned'); if (li.classList.contains('pinned')) taskList.prepend(li); saveTasks(); };

  li.appendChild(span);
  li.appendChild(tags);
  li.appendChild(pinBtn);
  li.appendChild(deleteBtn);

  li.addEventListener('dragstart', e => { draggedItem = li; });
  li.addEventListener('dragover', e => e.preventDefault());
  li.addEventListener('drop', e => { e.preventDefault(); if (draggedItem && draggedItem !== li) taskList.insertBefore(draggedItem, li.nextSibling); saveTasks(); });

  return li;
}

function setFilter(type) { filter = type; filterTasks(); }

function filterTasks() {
  const searchText = searchInput.value.toLowerCase();
  document.querySelectorAll('#taskList li').forEach(li => {
    const text = li.querySelector('span').textContent.toLowerCase();
    const isCompleted = li.classList.contains('completed');
    const cat = li.querySelector('.tag').textContent.toLowerCase();
    let visible = true;
    if (filter === 'completed' && !isCompleted) visible = false;
    if (filter === 'active' && isCompleted) visible = false;
    if (['work','personal','study','shopping'].includes(filter) && cat !== filter) visible = false;
    if (!text.includes(searchText)) visible = false;
    li.style.display = visible ? 'block' : 'none';
  });
}

function saveTasks() {
  const tasks = [];
  taskList.querySelectorAll('li').forEach(li => {
    tasks.push({
      text: li.querySelector('span').textContent,
      category: li.querySelectorAll('.tag')[0].textContent,
      level: li.querySelectorAll('.tag')[1].textContent,
      completed: li.classList.contains('completed'),
      pinned: li.classList.contains('pinned')
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => {
    const li = createTaskElement(task.text, null, task.category, task.level, task.pinned);
    if (task.completed) li.classList.add('completed');
    if (task.pinned) taskList.prepend(li); else taskList.appendChild(li);
  });
}

function updateProgress() {
  const all = document.querySelectorAll('#taskList li').length;
  const done = document.querySelectorAll('#taskList li.completed').length;
  const percent = all ? Math.round((done / all) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressText.textContent = percent + "% Completed";
}
