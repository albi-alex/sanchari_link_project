let submittedTasks = [];
let trustPoints = 0; // ⭐ NEW FEATURE (TrustPoints)

// NAVIGATION
function showRequester(){
document.getElementById("home").style.display="none";
document.getElementById("requester").style.display="block";
}

function showProvider(){
document.getElementById("home").style.display="none";
document.getElementById("provider").style.display="block";
}

function goHome(){
document.getElementById("home").style.display="block";
document.getElementById("requester").style.display="none";
document.getElementById("provider").style.display="none";
document.getElementById("create-task").style.display="none";
document.getElementById("provider-tasks").style.display="none";
}

function loginRequester(){
document.getElementById("requester").style.display="none";
document.getElementById("create-task").style.display="block";
}

function loginProvider(){
showProviderTasks();
}

// TASK PROCESSOR
function processTask(text){

text=text.toLowerCase();

let category="General Help";
let skills="Basic Assistance";
let urgency="Medium (Timely)";

if(text.includes("clean")){
category="Home Care";
skills="Cleaning";
}
else if(text.includes("repair")||text.includes("fix")){
category="Maintenance";
skills="Technician";
}

if(text.includes("urgent")||text.includes("today")){
urgency="High (Immediately)";
}

return {category,skills,urgency};
}

// CREATE TASK
function createTask(){

const desc=document.getElementById("task-desc").value.trim();
const location=document.getElementById("task-location").value;

if(!desc||!location){
alert("Please type a task description and select a district.");
return;
}

const result=processTask(desc);

const newTask={
accepted:false,
completed:false,
proof:null,
description:desc,
location:location,
category:result.category,
skills:result.skills,
urgency:result.urgency,
timestamp:Date.now()
};

submittedTasks.push(newTask);

// ⭐ TASK PROCESSED RESULT BOX (EXISTING FEATURE RESTORED)
document.getElementById("task-result").innerHTML = `
<h3>Task Processed</h3>
<p><strong>Category:</strong> ${result.category}</p>
<p><strong>Skills Needed:</strong> ${result.skills}</p>
<p><strong>Urgency:</strong> ${result.urgency}</p>
<p><strong>Location:</strong> ${location}</p>
`;

document.getElementById("task-desc").value="";
document.getElementById("task-location").value="";
}

// ACCEPT TASK
function acceptTask(index){
submittedTasks[index].accepted=true;
showProviderTasks();
}

// COMPLETE TASK + TRUSTPOINTS ⭐
function completeTask(index){

submittedTasks[index].completed=true;

// ⭐ ADD TRUSTPOINTS WITHOUT CHANGING OLD LOGIC
trustPoints += 10;

showProviderTasks();
}

// CAMERA PROOF UPLOAD
function uploadProof(event,index){

const file=event.target.files[0];
if(!file) return;

const reader=new FileReader();

reader.onload=function(e){
submittedTasks[index].proof=e.target.result;
showProviderTasks();
};

reader.readAsDataURL(file);
}

// SHOW PROVIDER TASKS
function showProviderTasks(){

document.getElementById("home").style.display="none";
document.getElementById("requester").style.display="none";
document.getElementById("provider").style.display="none";
document.getElementById("create-task").style.display="none";
document.getElementById("provider-tasks").style.display="block";

// ⭐ SHOW TRUSTPOINTS IN TITLE
const heading=document.querySelector("#provider-tasks h2");
heading.innerHTML=`Submitted Tasks ⭐ TrustPoints: ${trustPoints}`;

const tasksList=document.getElementById("tasks-list");
const loadingText=document.getElementById("loading-tasks");

tasksList.innerHTML="";
loadingText.style.display="block";

setTimeout(()=>{

loadingText.style.display="none";

if(submittedTasks.length===0){
tasksList.innerHTML="<p>No tasks submitted yet.</p>";
return;
}

let html="<ul style='list-style:none;padding:0;'>";

submittedTasks.forEach((t,index)=>{

let statusHTML="";
let buttonHTML="";

if(t.completed){

statusHTML=`<p style="color:green;"><strong>Status:</strong> Completed ✅</p>`;

if(t.proof){
statusHTML+=`<img src="${t.proof}" style="margin-top:10px;width:140px;border-radius:10px;">`;
}
}

else if(t.accepted){

statusHTML=`<p style="color:blue;"><strong>Status:</strong> Accepted</p>`;

let proofPreview="";
if(t.proof){
proofPreview=`<p style="color:green;">Proof Selected ✔</p>
<img src="${t.proof}" style="width:120px;border-radius:8px;margin-top:5px;">`;
}

buttonHTML=`
<button onclick="completeTask(${index})"
style="margin-top:10px;padding:8px 15px;background:green;color:white;border:none;border-radius:5px;">
Mark Completed
</button>

<br><br>

<input type="file"
accept="image/*"
capture="environment"
onchange="uploadProof(event, ${index})">

${proofPreview}
`;
}

else{
buttonHTML=`<button onclick="acceptTask(${index})"
style="margin-top:10px;padding:8px 15px;background:#1a3c6e;color:white;border:none;border-radius:5px;">
Accept Task
</button>`;
}

html+=`
<li style="border:1px solid #ccc;margin:10px;padding:10px;">
<p><strong>Description:</strong> ${t.description}</p>
<p><strong>Location:</strong> ${t.location}</p>
<p><strong>Category:</strong> ${t.category}</p>
<p><strong>Skills:</strong> ${t.skills}</p>
<p><strong>Urgency:</strong> ${t.urgency}</p>
${statusHTML}
${buttonHTML}
</li>`;
});

html+="</ul>";
tasksList.innerHTML=html;

},300);
}
