
// ELEMENTS
const taskInput = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const quote = document.getElementById("quote");

// FILTER BUTTONS
const filters = {
  all: document.getElementById("filter-all"),
  high: document.getElementById("filter-high"),
  medium: document.getElementById("filter-medium"),
  low: document.getElementById("filter-low"),
  done: document.getElementById("filter-done"),
  pending: document.getElementById("filter-pending")
};

// QUOTES ARRAY
const quotes = [
  "Stay productive! 😎",
  "You got this! 💪",
  "Plan, do, succeed! ✨",
  "One task at a time! ✅",
  "Make today amazing! 🌟"
];
quote.textContent = quotes[Math.floor(Math.random()*quotes.length)];

// LOAD TASKS
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
renderTasks();

// ADD TASK
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if(!text) return;
  const task = {
    id: Date.now(),
    text: text,
    priority: prioritySelect.value,
    done: false
  };
  tasks.push(task);
  saveTasks();
  renderTasks();
  taskInput.value = "";
});

// SAVE TASKS
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// RENDER TASKS
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.setAttribute("data-priority", task.priority);
    card.setAttribute("draggable", "true");
    card.dataset.id = task.id;
    if(task.done) card.classList.add("done");
    card.innerHTML = `
      <p>${task.text} (${task.priority})</p>
      <button class="done-btn">${task.done ? "Undo" : "Done"}</button>
      <button class="delete-btn">Delete</button>
    `;

    // DONE / UNDO
    card.querySelector(".done-btn").addEventListener("click", () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    });

    // DELETE
    card.querySelector(".delete-btn").addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    // DRAG
    card.addEventListener("dragstart", () => card.classList.add("dragging"));
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      saveOrder();
    });

    taskList.appendChild(card);
  });
  updateCount();
  enableDrop();
}

// TASK COUNTER
function updateCount() {
  const total = tasks.length;
  const pending = tasks.filter(t => !t.done).length;
  taskCount.textContent = `Total: ${total} | Pending: ${pending};`
}

// FILTER FUNCTION
function filterTasks(filter) {
  const cards = document.querySelectorAll(".task-card");
  cards.forEach(card => {
    const priority = card.getAttribute("data-priority");
    const done = card.classList.contains("done");
    if(filter === "all") card.style.display = "flex";
    else if(filter === "high" || filter === "medium"||  filter === "low") {
      card.style.display = priority === filter ? "flex" : "none";
    } else if(filter === "done") card.style.display = done ? "flex" : "none";
    else if(filter === "pending") card.style.display = !done ? "flex" : "none";
  });
}

// CONNECT FILTER BUTTONS
filters.all.addEventListener("click", ()=>filterTasks("all"));
filters.high.addEventListener("click", ()=>filterTasks("high"));
filters.medium.addEventListener("click", ()=>filterTasks("medium"));
filters.low.addEventListener("click", ()=>filterTasks("low"));
filters.done.addEventListener("click", ()=>filterTasks("done"));
filters.pending.addEventListener("click", ()=>filterTasks("pending"));

// DRAG & DROP
function enableDrop() {
  const cards = document.querySelectorAll(".task-card");
  cards.forEach(card => {
    card.addEventListener("dragover", e=>e.preventDefault());
    card.addEventListener("drop", e=>{
      const dragging = document.querySelector(".dragging");

if(!dragging || dragging === card) return;
      const after = getDragAfterElement(taskList, e.clientY);
      if(!after) taskList.appendChild(dragging);
      else taskList.insertBefore(dragging, after);
    });
  });
}

function getDragAfterElement(container, y) {
  const draggable = [...container.querySelectorAll(".task-card:not(.dragging)")];
  return draggable.reduce((closest, child)=>{
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if(offset<0 && offset>closest.offset) return {offset:offset, element:child};
    else return closest;
  }, {offset: Number.NEGATIVE_INFINITY}).element;
}

// SAVE ORDER AFTER DRAG
function saveOrder() {
  const newTasks = [];
  taskList.querySelectorAll(".task-card").forEach(card=>{
    const text = card.querySelector("p").textContent;
    const task = tasks.find(t => `${t.text} (${t.priority})` === text);
    if(task) newTasks.push(task);
  });
  tasks = newTasks;
  saveTasks();
}