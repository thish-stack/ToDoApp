
    const taskInput = document.getElementById("taskInput");
    const addBtn = document.getElementById("addBtn");
    const saveBtn = document.getElementById("saveBtn");
    const tabs = document.querySelectorAll(".tab_btn");
    const taskContainer = document.querySelector(".task-container");
    const errorMessage = document.getElementById("error-message");
    const clearAllBtn = document.getElementById("clearAllBtn");
    const clearCompletedBtn = document.getElementById("clearCompletedBtn");
    const progressBar = document.getElementById("progress");
    const numbers = document.getElementById("numbers");

    let tasks =[];
    if (localStorage.getItem("tasks")) {
        tasks = JSON.parse(localStorage.getItem("tasks"));
    } else {
        tasks = [];
    }

    let editTaskId = null;

    displayTasks('All Tasks'); // Initially displaying with 'All Tasks' tab selected
    updateStats(); // 'All Tasks' as active tab initially
    setActiveTab('All Tasks');

    addBtn.addEventListener("click", addTask);
    saveBtn.addEventListener("click", saveTask);
    tabs.forEach(tab => tab.addEventListener("click", switchTab));
    clearAllBtn.addEventListener("click", clearAllTasks);
    clearCompletedBtn.addEventListener("click", clearCompletedTasks);
    taskInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            if (saveBtn.style.display === "none") {
                addTask(); // Add task if save button is not displayed (adding new task)
            } else {
                saveTask(); // Save task if save button is displayed (editing existing task)
            }
        }
    });

   

    function addTask() {
        const taskName = taskInput.value.trim();
        if (taskName === '') {
            displayError();
            return;
        }
        let nextTaskId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
        tasks.push({
            id:nextTaskId,
            name: taskName,
            status: 'assigned'
        });
        taskInput.value = ''; // Clear input after adding task
        saveTasks();
        displayTasks('All Tasks');
        updateStats(); 
        displayNoTasksMessage();
    }

    function editTask(taskId) {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (taskToUpdate) {
            taskInput.value = taskToUpdate.name; 
            editTaskId = taskId;
            addBtn.style.display = "none"; // Hide add button
            saveBtn.style.display = "inline"; // Show save button
            disableDeleteClearButtons(true); 
            clearAllBtn.style.display = "none"; // Hide clear all button
            clearCompletedBtn.style.display = "none";
            updateStats(); // Update progress after editing task
            displayNoTasksMessage();
        }
    }

    function saveTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            displayError();
            return;
        }
        const taskToUpdate = tasks.find(task => task.id === editTaskId);
        if (taskToUpdate) {
            taskToUpdate.name = taskText; // Update task name
            editTaskId = null; // Reset editTaskId
            taskInput.value = ''; // Clear task input
            addBtn.style.display = "inline"; // Show add button
            saveBtn.style.display = "none"; // Hide save button
            disableDeleteClearButtons(false); 
            clearAllBtn.style.display = "inline-block"; // Show clear all button
            clearCompletedBtn.style.display = "inline-block";
            saveTasks(); // Save tasks to local storage
            displayTasks(getActiveTab()); 
            updateStats(); 
            displayNoTasksMessage();
        }
    }

    function disableDeleteClearButtons(disabled) {
        
        if (disabled) {
            taskContainer.classList.add('disabled');
        } else {
            taskContainer.classList.remove('disabled');
        }
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        displayTasks(getActiveTab()); 
        updateStats(); 
        displayNoTasksMessage();
    }

    function toggleTaskStatus(taskId) {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (taskToUpdate) {
            taskToUpdate.status = taskToUpdate.status === 'completed' ? 'assigned' : 'completed';
            saveTasks();
            displayTasks(getActiveTab()); 
            updateStats(); 
        }
    }
   

    function switchTab(event) {
        const tabName = event.target.innerText.trim();
        setActiveTab(tabName); // Set the active tab
        displayTasks(tabName); 
    }

    function getActiveTab() {
        return document.querySelector('.tab_btn.active').innerText.trim(); // Get text of the active tab
    }

    function setActiveTab(tabName) {
        tabs.forEach(tab => {
            if (tab.innerText.trim() === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function displayTasks(tabName = 'All Tasks') {
        taskContainer.innerHTML = '';
        tasks.forEach(task => {
            if (
                tabName === 'All Tasks' ||
                (tabName === 'Assigned' && task.status === 'assigned') ||
                (tabName === 'Completed' && task.status === 'completed')
            ) {
                const taskElement = document.createElement('div');
                taskElement.classList.add('task');
                taskElement.innerHTML = `
                    <input type="checkbox" class="checkbox" ${task.status === 'completed' ? 'checked' : ''} onchange="toggleTaskStatus(${task.id})"/>
                    <p ${task.status === 'completed' ? 'class="completed"' : ''}>${task.name}</p>
                    ${task.status !== 'Completed' ? `<button onclick="editTask(${task.id})"><img src="images/edit.png" class="edit-img"></button>` : ''}
                    <button onclick="deleteTask(${task.id})"><img src="images/deleteicon.png" class="delete-img"></button>
                `;
                taskContainer.appendChild(taskElement);
            }
        });
        updateClearCompletedButton();
        updateStats(); 
        displayNoTasksMessage();
    }

    function clearAllTasks() {
        tasks = [];
        saveTasks();
        displayTasks(getActiveTab()); 
        updateStats(); 
        displayNoTasksMessage();
    }

    function clearCompletedTasks() {
        tasks = tasks.filter(task => task.status !== 'completed');
        saveTasks();
        displayTasks(getActiveTab()); // display tasks for the active tab
        updateStats(); 
        displayNoTasksMessage();
    }

    function updateClearCompletedButton() {
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        clearCompletedBtn.style.display = completedTasks > 0 ? 'inline-block' : 'none';
    }

    function updateStats() {
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const totalTasks = tasks.length;
        const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${progress}%`;
        numbers.innerText = `${completedTasks}/${totalTasks}`;
        const completionMessage = document.querySelector('.completion-message');
        if (progress === 100 ) {
            completionMessage.style.visibility = 'visible';
        } else {
            completionMessage.style.visibility = 'hidden';
        }
    }

    function displayError() {
        errorMessage.innerHTML = ' <img src="images/exclamation.png" class="error-img"> <span>Please enter a valid task</span>';
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 3000);
    }

    function displayNoTasksMessage() {
        if (tasks.length === 0) {
            taskContainer.innerHTML = '<p class="no-tasks">No tasks available</p>';
        }
    }

   

