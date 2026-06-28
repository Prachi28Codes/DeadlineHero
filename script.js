const themeToggle = document.getElementById("themeToggle");

// Check if user has a saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

// Toggle theme when button is clicked
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 Dark Mode";
    }
});
let lastRequestTime = 0;
async function planDay() {
    const now = Date.now();
if (now - lastRequestTime < 5000) {
    alert("Wait 5 seconds before next request");
    return;
}
lastRequestTime = now;
    const button = document.querySelector("button");
    const result = document.getElementById("result");
    const task = document.getElementById("task").value.trim();

    if (!task) {
        alert("Please enter your tasks.");
        return;
    }
    if(button.disabled) return;
    button.disabled = true;
    button.textContent = "⏳ Generating...";

    result.innerHTML = `
                <h2>🤖 AI is Thinking...</h2>

                <div class="result-card">

                <h3>🧠 Analyzing your tasks...</h3>

<p>📚 Finding your highest priorities...</p>

<p>⏰ Building the perfect schedule...</p>

<p>✨ Almost done...</p>
            </div>
            `;

    try {
        const response = await fetch("/plan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ task })
        });

        const data = await response.json();

            if (!response.ok) {
    result.innerHTML = `
        <div class="result-card">
            <h3>⚠️ Error</h3>
            <p>${data.reply || "Something went wrong"}</p>
        </div>
    `;
    return;
}
        result.innerHTML = `
    <h2>🤖 Your Personal AI Plan</h2>

    <div class="result-card ai-result">
    ${
        data.reply
        .replace(/\*\*(.*?)\*\*/g,"<h3>$1</h3>")
        .replace(/\n/g,"<br>")
    }
</div>
`;
localStorage.setItem("lastPlan",result.innerHTML);
    updateProgress(25);
    const tasks = task
    .split(/\n|,|\s+and\s+|\s*&\s*/i)
    .map(t => t.trim())
    .filter(t => t !== "");

createTaskTracker(tasks);
    localStorage.setItem("lastPlan",result.innerHTML);
    } catch (err) {
        result.innerHTML = `<p>❌ ${err.message}</p>`;
        console.error(err);
    } finally {
    button.disabled = false;
    button.textContent = "🚀 Generate AI Study Plan";
}
}
function downloadPDF() {
    const element = document.getElementById("result");

    html2canvas(element, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        const pageWidth = 190;
        const pageHeight = (canvas.height * pageWidth) / canvas.width;

        doc.addImage(imgData, "PNG", 10, 10, pageWidth, pageHeight);

        doc.save("DeadlineHero.pdf");
    });
}
function copyPlan(){
    const text =

    document.getElementbyId("result").innerText;

    navigator.clipboard.writeText(text);

    alert("✅ Plan copied successfully!");
}
function clearTasks(){

    document.getElementById("task").value = "";

    document.getElementById("result").innerHTML = "";

    document.getElementById("taskTracker").innerHTML = "";

    document.getElementById("progressBar").value = 0;

    document.getElementById("progressText").textContent =
        "0% Complete";

    localStorage.removeItem("lastPlan");

    completedTasks = 0;
}
function readPlan() {

    const text =
        document.getElementById("result").innerText;

    if (!text) {
        alert("Generate a plan first!");
        return;
    }

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.rate = 1;

    speech.pitch = 1;

    speechSynthesis.speak(speech);
}
function updateCount() {
    const task = document.getElementById("task");

    const count = document.getElementById("charCount");

    count.textContent =
        `${task.value.length} / 500 characters`;
}
window.onload = function () {

    const savedPlan =
        localStorage.getItem("lastPlan");

    if (savedPlan) {

        document.getElementById("result")
            .innerHTML = savedPlan;
    }
};
function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Speech recognition not supported");
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = function(event) {

        const text = event.results[0][0].transcript;

        const input = document.getElementById("task");

        input.value += text + " ";

        updateCount();
    };

    recognition.onerror = function(event) {
        alert("Voice error: " + event.error);
    };

    recognition.start();
}
function updateProgress(percent) {
    document.getElementById("progressBar").value = percent;
    document.getElementById("progressText").textContent =
        `${percent}% Complete`;
}
function createTaskTracker(tasks) {

    const tracker = document.getElementById("taskTracker");

    tracker.innerHTML = "<h3>✅ Task Tracker</h3>";

    let completed = 0;

    tasks.forEach(task => {

        tracker.innerHTML += `
            <div class="task-item">
                <input type="checkbox" 
                onchange="taskCompleted(this, ${tasks.length})">
                ${task}
            </div>
        `;

    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
let completedTasks = 0;

function taskCompleted(checkbox, totalTasks) {

    const checkedTasks =
        document.querySelectorAll(
            '#taskTracker input[type="checkbox"]:checked'
        ).length;

    const percent =
        Math.round((checkedTasks / totalTasks) * 100);

    updateProgress(percent);
}
function updateGreeting(){

    const hour = new Date().getHours();

    const greeting = document.getElementById("greeting");

    if(hour < 12){

        greeting.innerHTML = "☀️ Good Morning!<br><span>Deadline Hero</span>";

    }

    else if(hour < 17){

        greeting.innerHTML = "🌤 Good Afternoon!<br><span>Deadline Hero</span>";

    }

    else{

        greeting.innerHTML = "🌙 Good Evening!<br><span>Deadline Hero</span>";

    }

}

updateGreeting();
function addToCalendar(title, description, date) {
    const event = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
DTSTART:${date}
DTEND:${date}
END:VEVENT
END:VCALENDAR
`;

    const blob = new Blob([event], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "event.ics";
    a.click();
}
window.onload = function () {
    const saved = localStorage.getItem("tasks");

    if (saved) {
        const tasks = JSON.parse(saved);
        createTaskTracker(tasks);
    }
};
window.onload = function () {

    const savedPlan = localStorage.getItem("lastPlan");

    if (savedPlan) {
        document.getElementById("result").innerHTML = savedPlan;
    }

    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        createTaskTracker(tasks);
    }
};
