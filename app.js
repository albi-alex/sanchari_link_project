// ----------------------------
// Global Variables
// ----------------------------
let currentProvider = null;
let tasks = [];
let providers = {};
let requesterInfo = {}; // Store requester's WhatsApp & Address

// ----------------------------
// Simulated Backend API
// ----------------------------
const BackendAPI = {
    saveTask: async (task) => {
        return new Promise(resolve => {
            setTimeout(() => {
                tasks.push(task);
                resolve(task);
            }, 300);
        });
    },
    loginProvider: async (email) => {
        return new Promise(resolve => {
            setTimeout(() => {
                if(!providers[email]) providers[email] = {trustPoints:0};
                resolve(providers[email]);
            }, 200);
        });
    },
    updateTask: async (taskId, updates) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let t = tasks.find(task => task.id === taskId);
                Object.assign(t, updates);
                resolve(t);
            }, 200);
        });
    },
    getTasks: async () => {
        return new Promise(resolve => {
            setTimeout(() => resolve([...tasks]), 200);
        });
    }
};

// ----------------------------
// Show / Hide Sections
// ----------------------------
function hideAll() {
    document.getElementById("home").style.display="none";
    document.getElementById("requester").style.display="none";
    document.getElementById("provider").style.display="none";
    document.getElementById("create-task").style.display="none";
    document.getElementById("provider-tasks").style.display="none";
}

function showRequester() { hideAll(); document.getElementById("requester").style.display="block"; }
function showProvider() { hideAll(); document.getElementById("provider").style.display="block"; }
function showCreateTask() { hideAll(); document.getElementById("create-task").style.display="block"; }
function showProviderTasks() { hideAll(); document.getElementById("provider-tasks").style.display="block"; renderProviderInfo(); renderProviderTasks(); }
function goHome() { hideAll(); document.getElementById("home").style.display="block"; }

// ----------------------------
// Login
// ----------------------------
async function loginRequester(){
    const email = document.getElementById("requester-email").value.trim();
    const whatsapp = document.getElementById("requester-whatsapp").value.trim();
    const address = document.getElementById("requester-address").value.trim();

    if(email && whatsapp && address){
        requesterInfo = {email, whatsapp, address};
        document.getElementById("requester-email").value="";
        document.getElementById("requester-whatsapp").value="";
        document.getElementById("requester-address").value="";
        showCreateTask(); 
    } else alert("Fill all fields");
}

async function loginProvider(){
    const email = document.getElementById("provider-email").value.trim();
    if(email){
        currentProvider=email;
        await BackendAPI.loginProvider(email);
        document.getElementById("provider-email").value="";
        showProviderTasks();
    } else alert("Enter email");
}

// ----------------------------
// Task Creation
// ----------------------------
async function createTask(){
    const desc = document.getElementById("task-desc").value.trim();
    const location = document.getElementById("task-location").value;
    if(!desc || !location){ alert("Fill all fields"); return; }

    const { category, skills, urgency } = processTask(desc);

    const task = {
        id: Date.now() + Math.random(),
        description: desc,
        location,
        category,
        skills,
        urgency,
        provider:null,
        accepted:false,
        completed:false,
        saved:false,
        timestamp:Date.now(),
        requesterWhatsApp: requesterInfo.whatsapp,
        requesterAddress: requesterInfo.address
    };

    await BackendAPI.saveTask(task);

    document.getElementById("task-result").innerHTML=`<strong>Task Submitted ✅</strong>
    <p>Description: ${desc}</p>
    <p>District: ${location}</p>
    <p>Address: ${task.requesterAddress}</p>
    <p>WhatsApp: ${task.requesterWhatsApp}</p>
    <p>Category: ${category}</p><p>Skills: ${skills}</p><p>Urgency: ${urgency}</p>`;

    document.getElementById("task-desc").value="";
    document.getElementById("task-location").value="";
}

// ----------------------------
// Process Task Keywords
// ----------------------------
function processTask(text){
    text = text.toLowerCase();
    let category="General", skills="None", urgency="Medium";

    if(text.includes("plumb")) { category="Plumbing"; skills="Plumbing Skills"; }
    else if(text.includes("electric")) { category="Electrical"; skills="Electrical Skills"; }
    else if(text.includes("medical")) { category="Medical"; skills="Medical Professional/Nurse"; }
    else if(text.includes("clean")) { category="Cleaning"; skills="Cleaning Staff"; }
    else if(text.includes("shop")) { category="Shopping"; skills="Shopping Assistance"; }
    else if(text.includes("garden")) { category="Gardening"; skills="Gardener"; }
    else if(text.includes("paint")) { category="Painting"; skills="Painter"; }

    if(/immediately|today|urgent|asap|emergency|now|soon/.test(text)) urgency="Immediate";
    else if(/this week|next week/.test(text)) urgency="Medium";
    else if(/later|next month/.test(text)) urgency="Low";
    else if(/next year|one year/.test(text)) urgency="Very Low";

    return {category, skills, urgency};
}

// ----------------------------
// Provider Info
// ----------------------------
function renderProviderInfo(){
    document.getElementById("provider-info").innerHTML=`Provider: ${currentProvider} | Trust Points: ${providers[currentProvider].trustPoints}`;
}

// ----------------------------
// Render Tasks
// ----------------------------
async function renderProviderTasks(){
    const listDiv=document.getElementById("tasks-list");
    let allTasks = await BackendAPI.getTasks();
    let filtered = allTasks.filter(t => !t.completed);
    filtered.sort((a,b)=>urgencyOrder(a.urgency)-urgencyOrder(b.urgency) || a.timestamp-b.timestamp);

    if(filtered.length===0){ listDiv.innerHTML="<p>No tasks available</p>"; return; }

    listDiv.innerHTML = "";

    filtered.forEach((t)=>{
        const li = document.createElement("li");
        li.className = "task-item";
        li.innerHTML = `
            <p><strong>Description:</strong> ${t.description}</p>
            <p><strong>District:</strong> ${t.location}</p>
            <p><strong>Address:</strong> ${t.requesterAddress}</p>
            <p><strong>WhatsApp:</strong> ${t.requesterWhatsApp}</p>
            <p><strong>Category:</strong> ${t.category}</p>
            <p><strong>Skills:</strong> ${t.skills}</p>
            <p><strong>Urgency:</strong> ${t.urgency}</p>
            <button class="accept-btn">${t.accepted?'Accepted ✅':'Accept Task'}</button>
            <button class="save-btn">${t.saved?'Saved for Later 🗄':'Save for Later'}</button>
            <button class="complete-btn">${t.completed?'Completed the Task 🏆':'Mark Completed'}</button>
        `;

        li.querySelector(".accept-btn").addEventListener("click", async ()=>{ await toggleAccept(t.id); });
        li.querySelector(".save-btn").addEventListener("click", async ()=>{ await toggleSave(t.id); });
        li.querySelector(".complete-btn").addEventListener("click", async ()=>{ await toggleComplete(t.id); });

        listDiv.appendChild(li);
    });
}

function urgencyOrder(u){ return {Immediate:1, Medium:2, Low:3, 'Very Low':4}[u] || 5; }

// ----------------------------
// Task Actions
// ----------------------------
async function toggleAccept(taskId){
    let t=tasks.find(task=>task.id===taskId);
    if(!t.accepted){ t.accepted=true; t.provider=currentProvider; providers[currentProvider].trustPoints+=2; }
    else { t.accepted=false; t.provider=null; providers[currentProvider].trustPoints-=2; }

    await BackendAPI.updateTask(taskId, t);
    renderProviderInfo(); renderProviderTasks();
}

async function toggleSave(taskId){
    let t=tasks.find(task=>task.id===taskId);
    t.saved = !t.saved;
    await BackendAPI.updateTask(taskId, t);
    renderProviderTasks();
}

async function toggleComplete(taskId){
    let t=tasks.find(task=>task.id===taskId);
    if(!t.completed){
        t.completed=true;
        if(!t.accepted){ t.accepted=true; providers[currentProvider].trustPoints+=2; }
        providers[currentProvider].trustPoints+=5;
    } else {
        t.completed=false;
        providers[currentProvider].trustPoints-=5;
    }
    await BackendAPI.updateTask(taskId, t);
    renderProviderInfo(); renderProviderTasks();
}
