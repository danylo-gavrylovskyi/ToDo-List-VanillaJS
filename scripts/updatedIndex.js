class TodoItem {
  constructor(id, title, date, isCompleted) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.isCompleted = isCompleted;
  }
}

class TodoItemPremium extends TodoItem {
  constructor(id, title, date, isCompleted, iconUrl) {
    super(id, title, date, isCompleted);
    this.iconUrl = iconUrl;
  }
}

const tasksDiv = document.getElementById('tasks');
const completed = document.getElementById('completed');
const titleInput = document.getElementById('task-title-input');
const uncompletedTasksCountElem = document.getElementById('uncompleted-tasks-count');
const completedTasksCountElem = document.getElementById('completed-tasks-count');
const sortBtn = document.getElementById('sort-btn');
const clearStorageBtn = document.getElementById('clear-storage-btn');
const pickTodoBtn = document.getElementById('pick-todo-btn');

let tasks = [];

let activeTodo = null;

const lsTasks = localStorage.getItem('tasks');
if (lsTasks) tasks = JSON.parse(lsTasks);

let id = 0;

let isSortedAsc = true;
const lsSort = localStorage.getItem('isSortedAsc');
if (lsSort) isSortedAsc = lsSort === '1' ? true : false;
sortBtn.innerHTML = `Sort by date: ${isSortedAsc ? 'DESC' : 'ASC'}`;

let sortAsc = (a, b) => new Date(b.date) - new Date(a.date);
let sortDesc = (a, b) => new Date(a.date) - new Date(b.date);
sortBtn.addEventListener('click', () => {
  isSortedAsc = !isSortedAsc;
  sortBtn.innerHTML = `Sort by date: ${isSortedAsc ? 'DESC' : 'ASC'}`;
  localStorage.setItem('isSortedAsc', `${isSortedAsc ? '1' : '0'}`);
  render();
});

clearStorageBtn.addEventListener('click', () => {
  localStorage.clear();
});

pickTodoBtn.addEventListener('click', () => {
  const uncompletedTask = tasks.filter((task) => !task.isCompleted);

  const randomIndex = Math.floor(Math.random() * uncompletedTask.length);
  const selectedTask = uncompletedTask[randomIndex];

  const selectedTaskElem = document.getElementById(`task${selectedTask.id}`);

  if (activeTodo) activeTodo.style.border = 'none';
  activeTodo = selectedTaskElem;

  selectedTaskElem.style.border = '2px solid rgb(228, 129, 146)';
});

const toggleTask = (id) => {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, isCompleted: !task.isCompleted } : task,
  );

  render();
};

exitEditingMode = (title, input, checkbox, saveBtn) => {
  input.value = '';

  title.style.display = 'block';
  input.style.display = 'none';

  checkbox.style.display = 'block';
  saveBtn.style.display = 'none';
};

editTask = (id, title, input, checkbox, saveBtn) => {
  if (!input.value) {
    alert('Enter task title');
    return;
  }

  tasks = tasks.map((task) =>
    task.id === id ? { ...task, title: input.value, date: new Date().toLocaleString() } : task,
  );
  exitEditingMode(title, input, checkbox, saveBtn);

  render();
};

enterEditingMode = (id) => {
  const title = document.getElementById(`title${id}`);
  const input = document.getElementById(`title-input-${id}`);
  const saveBtn = document.getElementById(`save${id}`);
  const checkbox = document.getElementById(`checkbox${id}`);

  title.style.display = 'none';
  input.style.display = 'block';
  input.focus();

  checkbox.style.display = 'none';
  saveBtn.style.display = 'block';

  saveBtn.addEventListener('click', () => editTask(id, title, input, checkbox, saveBtn));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      editTask(id, title, input, checkbox, saveBtn);
    } else if (e.key === 'Escape') {
      exitEditingMode(title, input, checkbox, saveBtn);
    }
  });
};

const deleteTask = (id) => {
  tasks = tasks.filter((task) => task.id !== id);

  render();
};

const addTask = () => {
  if (!titleInput.value) {
    alert('Enter task title');
    return;
  }

  id++;

  tasks.push(new TodoItem(id, titleInput.value, new Date().toLocaleString(), false));
  titleInput.value = '';

  render();
};

const removeAllTasks = () => {
  const uncompletedTask = tasks.find((task) => !task.isCompleted);
  if (uncompletedTask) {
    const answer = prompt(
      'You have uncompleted task, are you sure you want to remove all tasks ? yes/no',
    );
    if (answer === 'no') return;
  }

  tasks = [];
  render();
};

const removeCompleted = () => {
  tasks = tasks.filter((task) => !task.isCompleted);
  render();
};

titleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTask();
  } else if (e.key === 'Escape') {
    titleInput.value = '';
    titleInput.blur();
  }
});

const getTaskLayout = ({ id, title, date }) => `<section id='task${id}'>
<div class="task-left-side">
  <label id='checkbox${id}' for='${id}' onclick='toggleTask(${id})' class="checkbox">
    <i class="fa-solid fa-check"></i>
    <input id='${id}' type="checkbox" />
  </label>

  <button id='save${id}' class='save-edited-task'><i class="fa-regular fa-floppy-disk"></i></button>

  <div ondblclick='enterEditingMode(${id})'>
    <p id='title${id}' class="task__name">${title}</p>
    <input id='title-input-${id}' class='title-edit-input' value='${title}'>
    <p class="task__date">${date}</p>
  </div>
</div>

<i onclick='deleteTask(${id})' class="fa-regular fa-trash-can"></i>
</section>`;

const render = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));

  tasksDiv.innerHTML = '';
  completed.innerHTML = '';

  const uncompletedTasksCount = tasks.filter((task) => !task.isCompleted).length;
  const completedTasksCount = tasks.filter((task) => task.isCompleted).length;
  uncompletedTasksCountElem.innerHTML = `Tasks - ${uncompletedTasksCount}`;
  completedTasksCountElem.innerHTML = `Completed - ${completedTasksCount}`;

  tasks.sort(isSortedAsc ? sortAsc : sortDesc).map((task) => {
    !task.isCompleted
      ? (tasksDiv.innerHTML += getTaskLayout(task))
      : (completed.innerHTML += getTaskLayout(task));
  });
};

render();
