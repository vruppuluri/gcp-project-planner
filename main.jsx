import { useState, useEffect, useRef } from "react";

const COLORS = {
  infra: { bg: "#EFF6FF", text: "#1e40af", border: "#bfdbfe" },
  iam:   { bg: "#F5F3FF", text: "#5b21b6", border: "#ddd6fe" },
  net:   { bg: "#ECFDF5", text: "#065f46", border: "#a7f3d0" },
  sec:   { bg: "#FFF7ED", text: "#9a3412", border: "#fed7aa" },
  ci:    { bg: "#F0FDF4", text: "#14532d", border: "#bbf7d0" },
  mon:   { bg: "#FEF2F2", text: "#991b1b", border: "#fecaca" },
  app:   { bg: "#FFF1F2", text: "#9f1239", border: "#fecdd3" },
};

const STATUS_META = {
  todo:    { label: "To do",       bg: "#F3F4F6", text: "#374151" },
  prog:    { label: "In progress", bg: "#EFF6FF", text: "#1d4ed8" },
  done:    { label: "Done",        bg: "#ECFDF5", text: "#065f46" },
  block:   { label: "Blocked",     bg: "#FEF2F2", text: "#991b1b" },
};

const PRIO_META = {
  high:   { bg: "#FEF2F2", text: "#991b1b" },
  med:    { bg: "#FFFBEB", text: "#92400e" },
  low:    { bg: "#F0FDF4", text: "#14532d" },
};

const INITIAL_TASKS = [
  { id:1,  name:"Create GCP project & billing account",   cat:"infra", assignee:"Alex Chen",     prio:"high", status:"done",  sprint:"S1", start:"2026-04-01", end:"2026-04-04" },
  { id:2,  name:"Design VPC network topology",             cat:"net",   assignee:"Priya Sharma",  prio:"high", status:"done",  sprint:"S1", start:"2026-04-01", end:"2026-04-07" },
  { id:3,  name:"Set up Terraform state backend (GCS)",    cat:"infra", assignee:"Alex Chen",     prio:"high", status:"done",  sprint:"S1", start:"2026-04-03", end:"2026-04-06" },
  { id:4,  name:"Configure Artifact Registry",             cat:"ci",    assignee:"Alex Chen",     prio:"med",  status:"done",  sprint:"S1", start:"2026-04-05", end:"2026-04-08" },
  { id:5,  name:"Configure Shared VPC & subnets",          cat:"net",   assignee:"Priya Sharma",  prio:"high", status:"prog",  sprint:"S2", start:"2026-04-14", end:"2026-04-21" },
  { id:6,  name:"Set up Cloud NAT & firewall rules",       cat:"net",   assignee:"Priya Sharma",  prio:"med",  status:"prog",  sprint:"S2", start:"2026-04-16", end:"2026-04-24" },
  { id:7,  name:"Provision GKE cluster (Autopilot)",       cat:"infra", assignee:"Alex Chen",     prio:"high", status:"prog",  sprint:"S2", start:"2026-04-14", end:"2026-04-28" },
  { id:8,  name:"Deploy CI/CD pipeline (Cloud Build)",     cat:"ci",    assignee:"Alex Chen",     prio:"high", status:"prog",  sprint:"S2", start:"2026-04-17", end:"2026-04-30" },
  { id:9,  name:"Create Terraform modules (VPC, GKE)",     cat:"infra", assignee:"Alex Chen",     prio:"high", status:"prog",  sprint:"S2", start:"2026-04-14", end:"2026-04-30" },
  { id:10, name:"Configure Workload Identity Federation",  cat:"iam",   assignee:"Marcus Webb",   prio:"high", status:"todo",  sprint:"S2", start:"2026-04-21", end:"2026-04-30" },
  { id:11, name:"Define IAM roles & org policies",         cat:"iam",   assignee:"Marcus Webb",   prio:"high", status:"todo",  sprint:"S2", start:"2026-04-21", end:"2026-04-30" },
  { id:12, name:"Set up Cloud SQL (PostgreSQL HA)",         cat:"infra", assignee:"Lena Park",     prio:"high", status:"todo",  sprint:"S2", start:"2026-04-24", end:"2026-05-05" },
  { id:13, name:"Configure VPC Service Controls",          cat:"sec",   assignee:"Sara Okonkwo",  prio:"high", status:"block", sprint:"S2", start:"2026-04-21", end:"2026-05-02" },
  { id:14, name:"Set up Secret Manager & CMEK",            cat:"sec",   assignee:"Sara Okonkwo",  prio:"high", status:"todo",  sprint:"S2", start:"2026-04-24", end:"2026-05-07" },
  { id:15, name:"Enable Cloud Armor WAF policies",         cat:"sec",   assignee:"Sara Okonkwo",  prio:"med",  status:"todo",  sprint:"S3", start:"2026-05-05", end:"2026-05-16" },
  { id:16, name:"Configure Cloud Logging sinks",           cat:"mon",   assignee:"Jin Torres",    prio:"med",  status:"todo",  sprint:"S3", start:"2026-05-05", end:"2026-05-14" },
  { id:17, name:"Set up Cloud Monitoring dashboards",      cat:"mon",   assignee:"Jin Torres",    prio:"med",  status:"todo",  sprint:"S3", start:"2026-05-07", end:"2026-05-19" },
  { id:18, name:"Deploy Cloud Load Balancer + SSL",        cat:"net",   assignee:"Priya Sharma",  prio:"med",  status:"todo",  sprint:"S3", start:"2026-05-05", end:"2026-05-15" },
  { id:19, name:"Configure alerting & PagerDuty",          cat:"mon",   assignee:"Jin Torres",    prio:"med",  status:"todo",  sprint:"S3", start:"2026-05-14", end:"2026-05-23" },
  { id:20, name:"Run security compliance audit",           cat:"sec",   assignee:"Sara Okonkwo",  prio:"high", status:"todo",  sprint:"S4", start:"2026-05-26", end:"2026-06-06" },
];

const RESOURCES = [
  { name:"Alex Chen",    role:"DevOps Lead",        alloc:90, color:"#1d4ed8", initial:"AC" },
  { name:"Priya Sharma", role:"Network Engineer",   alloc:70, color:"#065f46", initial:"PS" },
  { name:"Marcus Webb",  role:"IAM Engineer",       alloc:60, color:"#5b21b6", initial:"MW" },
  { name:"Sara Okonkwo", role:"Security Engineer",  alloc:80, color:"#9a3412", initial:"SO" },
  { name:"Lena Park",    role:"DB Administrator",   alloc:50, color:"#92400e", initial:"LP" },
  { name:"Jin Torres",   role:"SRE",                alloc:65, color:"#14532d", initial:"JT" },
];

const STAKEHOLDERS = [
  { name:"CTO Office",           role:"Executive sponsor", interest:"Budget & timeline",          notify:"Weekly summary",    tf:"Project billing" },
  { name:"Platform Team",        role:"Owner / builder",   interest:"Architecture decisions",      notify:"Daily standup",     tf:"VPC, GKE, IAM" },
  { name:"App Dev Teams",        role:"Consumer",          interest:"GKE cluster, SQL access",     notify:"Sprint demos",      tf:"Namespaces, SAs" },
  { name:"Security & Compliance",role:"Approver",          interest:"IAM, VPC SC, audit logs",     notify:"Policy changes",    tf:"VPC SC, CMEK" },
  { name:"Finance",              role:"Observer",          interest:"Cost allocation & labels",     notify:"Monthly cost rpt",  tf:"Billing exports" },
  { name:"Operations / SRE",     role:"Operator",          interest:"Monitoring, runbooks, SLOs",  notify:"On incident",       tf:"Monitoring, alerts" },
  { name:"Legal / Data Privacy", role:"Approver",          interest:"Data residency & retention",  notify:"Data scope change", tf:"Region, DLP" },
];

const SPRINTS = [
  { id:"S1", label:"Sprint 1", start:"2026-04-01", end:"2026-04-11", goal:"Foundation: project setup, VPC design, state backend" },
  { id:"S2", label:"Sprint 2", start:"2026-04-14", end:"2026-05-02", goal:"Core infra: GKE, SQL, IAM, networking, CI/CD" },
  { id:"S3", label:"Sprint 3", start:"2026-05-05", end:"2026-05-23", goal:"Security & observability: WAF, logging, alerting" },
  { id:"S4", label:"Sprint 4", start:"2026-05-26", end:"2026-06-06", goal:"Hardening: compliance audit, DR test, handoff docs" },
];

function Badge({ cat }) {
  const c = COLORS[cat] || COLORS.infra;
  const labels = {infra:"Infrastructure",iam:"IAM",net:"Networking",sec:"Security",ci:"CI/CD",mon:"Monitoring",app:"App"};
  return <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:c.bg,color:c.text,border:`1px solid ${c.border}`,whiteSpace:"nowrap",fontWeight:500}}>{labels[cat]||cat}</span>;
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.todo;
  return <span style={{fontSize:11,padding:"2px 10px",borderRadius:20,background:m.bg,color:m.text,fontWeight:500}}>{m.label}</span>;
}

function PrioBadge({ prio }) {
  const m = PRIO_META[prio] || PRIO_META.low;
  return <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:m.bg,color:m.text,fontWeight:500}}>{prio}</span>;
}

function Avatar({ name, color, size=32 }) {
  const initials = name.split(" ").map(x=>x[0]).join("").slice(0,2);
  return <div style={{width:size,height:size,borderRadius:"50%",background:color+"22",color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:600,flexShrink:0}}>{initials}</div>;
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month:"short", day:"numeric" });
}

function daysLeft(end) {
  const now = new Date(); now.setHours(0,0,0,0);
  const e = new Date(end + "T00:00:00");
  return Math.ceil((e - now) / 86400000);
}

// ── Gantt helpers ───────────────────────────────────────────────
const GANTT_START = new Date("2026-04-01");
const GANTT_END   = new Date("2026-06-13");
const GANTT_DAYS  = Math.ceil((GANTT_END - GANTT_START) / 86400000);

function pct(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return Math.max(0, Math.min(100, ((d - GANTT_START) / (GANTT_END - GANTT_START)) * 100));
}

function GanttBar({ task }) {
  const left = pct(task.start);
  const right = 100 - pct(task.end);
  const c = COLORS[task.cat] || COLORS.infra;
  const statusColor = task.status === "done" ? "#059669" : task.status === "block" ? "#dc2626" : task.status === "prog" ? "#2563eb" : "#9ca3af";
  return (
    <div style={{position:"absolute",left:`${left}%`,right:`${right}%`,top:4,bottom:4,background:statusColor+"22",border:`1.5px solid ${statusColor}`,borderRadius:4,minWidth:6}}
      title={`${task.name}\n${formatDate(task.start)} → ${formatDate(task.end)}`}/>
  );
}

// ── AI Add Task Modal ─────────────────────────────────────────────
function AddTaskModal({ onClose, onAdd }) {
  const [step, setStep] = useState("form"); // form | loading | result
  const [form, setForm] = useState({ name:"", cat:"infra", prio:"med", assignee:"Alex Chen", sprint:"S2", start:"", end:"", status:"todo" });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [mode, setMode] = useState("manual"); // manual | ai

  async function generateAiTasks() {
    if (!aiPrompt.trim()) return;
    setStep("loading");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{ role:"user", content:`You are a GCP cloud project manager. Given this request: "${aiPrompt}"
Generate 3 specific, actionable GCP infrastructure tasks.
Respond ONLY with a JSON array (no markdown, no preamble):
[{"name":"...","cat":"infra|iam|net|sec|ci|mon","prio":"high|med|low","assignee":"Alex Chen|Priya Sharma|Marcus Webb|Sara Okonkwo|Lena Park|Jin Torres","sprint":"S1|S2|S3|S4","start":"2026-05-01","end":"2026-05-15","status":"todo"}]
Categories: infra=GCP resources, iam=permissions, net=networking, sec=security, ci=CI/CD pipelines, mon=monitoring.
Use realistic GCP-specific task names (e.g. "Enable Cloud Armor security policy", not generic names).` }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(c=>c.type==="text")?.text || "[]";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setAiSuggestions(parsed);
      setStep("result");
    } catch(e) {
      setAiSuggestions([{ name:"Configure Cloud Armor WAF rule set", cat:"sec", prio:"high", assignee:"Sara Okonkwo", sprint:"S3", start:"2026-05-05", end:"2026-05-12", status:"todo" }]);
      setStep("result");
    }
  }

  function submitManual() {
    if (!form.name.trim() || !form.start || !form.end) return;
    onAdd([{ ...form, id: Date.now() }]);
    onClose();
  }

  function addSuggestions(selected) {
    onAdd(selected.map((t,i) => ({ ...t, id: Date.now()+i })));
    onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:560,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",overflow:"hidden"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:600,fontSize:16}}>Add Task</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#6b7280",lineHeight:1}}>×</button>
        </div>

        <div style={{padding:"16px 24px 0"}}>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {["manual","ai"].map(m => (
              <button key={m} onClick={()=>{setMode(m);setStep("form");}} style={{flex:1,padding:"8px 0",borderRadius:8,border:`1.5px solid ${mode===m?"#2563eb":"#e5e7eb"}`,background:mode===m?"#eff6ff":"transparent",color:mode===m?"#1d4ed8":"#6b7280",fontWeight:500,fontSize:13,cursor:"pointer"}}>
                {m==="manual" ? "✏️ Manual entry" : "✨ AI suggest tasks"}
              </button>
            ))}
          </div>
        </div>

        {mode === "manual" && (
          <div style={{padding:"0 24px 24px"}}>
            {[
              ["Task name","name","text",null],
            ].map(([label,key,type]) => (
              <div key={key} style={{marginBottom:12}}>
                <label style={{fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:4}}>{label}</label>
                <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  style={{width:"100%",padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,outline:"none"}}
                  placeholder="e.g. Enable Binary Authorization on GKE" />
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[["Category","cat",["infra","iam","net","sec","ci","mon"]],["Priority","prio",["high","med","low"]],["Sprint","sprint",["S1","S2","S3","S4"]],["Status","status",["todo","prog","done","block"]]].map(([lbl,key,opts])=>(
                <div key={key}>
                  <label style={{fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:4}}>{lbl}</label>
                  <select value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    style={{width:"100%",padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,background:"#fff"}}>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[["Assignee","assignee",RESOURCES.map(r=>r.name)]].map(([lbl,key,opts])=>(
                <div key={key} style={{gridColumn:"1/-1"}}>
                  <label style={{fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:4}}>{lbl}</label>
                  <select value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    style={{width:"100%",padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,background:"#fff"}}>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              {[["Start date","start"],["End date","end"]].map(([lbl,key])=>(
                <div key={key}>
                  <label style={{fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:4}}>{lbl}</label>
                  <input type="date" value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    style={{width:"100%",padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13}} />
                </div>
              ))}
            </div>
            <button onClick={submitManual} disabled={!form.name||!form.start||!form.end}
              style={{width:"100%",padding:"10px",background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:14,cursor:"pointer",opacity:(!form.name||!form.start||!form.end)?0.5:1}}>
              Add Task
            </button>
          </div>
        )}

        {mode === "ai" && step === "form" && (
          <div style={{padding:"0 24px 24px"}}>
            <label style={{fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:6}}>Describe what you need</label>
            <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} rows={4}
              placeholder="e.g. Set up disaster recovery and database backup automation for the GCP environment"
              style={{width:"100%",padding:"10px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,resize:"vertical",fontFamily:"inherit"}} />
            <button onClick={generateAiTasks} disabled={!aiPrompt.trim()}
              style={{width:"100%",marginTop:10,padding:"10px",background:"#7c3aed",color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:14,cursor:"pointer",opacity:!aiPrompt.trim()?0.5:1}}>
              ✨ Generate Tasks with AI
            </button>
          </div>
        )}

        {mode === "ai" && step === "loading" && (
          <div style={{padding:"40px 24px",textAlign:"center",color:"#6b7280"}}>
            <div style={{fontSize:28,marginBottom:12,animation:"spin 1s linear infinite",display:"inline-block"}}>⚙️</div>
            <div style={{fontSize:14}}>Generating GCP tasks...</div>
          </div>
        )}

        {mode === "ai" && step === "result" && (
          <div style={{padding:"0 24px 24px"}}>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:10,fontWeight:500}}>AI suggested {aiSuggestions.length} tasks — review & add all:</div>
            {aiSuggestions.map((t,i) => (
              <div key={i} style={{padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:8,marginBottom:8,background:"#fafafa"}}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:6}}>{t.name}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <Badge cat={t.cat}/><PrioBadge prio={t.prio}/>
                  <span style={{fontSize:11,color:"#6b7280"}}>{t.assignee}</span>
                  <span style={{fontSize:11,color:"#6b7280"}}>{formatDate(t.start)} → {formatDate(t.end)}</span>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={()=>setStep("form")} style={{flex:1,padding:"9px",border:"1px solid #e5e7eb",borderRadius:8,background:"transparent",cursor:"pointer",fontSize:13}}>
                Try again
              </button>
              <button onClick={()=>addSuggestions(aiSuggestions)} style={{flex:2,padding:"9px",background:"#7c3aed",color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer"}}>
                Add {aiSuggestions.length} tasks ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── GANTT CHART ──────────────────────────────────────────────────
function GanttChart({ tasks }) {
  const weeks = [];
  let d = new Date(GANTT_START);
  while (d < GANTT_END) {
    weeks.push(new Date(d));
    d = new Date(d.getTime() + 7 * 86400000);
  }

  const sprints = SPRINTS.map(s => ({
    ...s,
    left: pct(s.start),
    width: pct(s.end) - pct(s.start),
  }));

  return (
    <div style={{overflowX:"auto"}}>
      <div style={{minWidth:900}}>
        {/* Sprint bands */}
        <div style={{position:"relative",height:28,marginBottom:4,marginLeft:200}}>
          {sprints.map(s => (
            <div key={s.id} style={{position:"absolute",left:`${s.left}%`,width:`${s.width}%`,height:"100%",background: s.id==="S1"?"#eff6ff":s.id==="S2"?"#f5f3ff":s.id==="S3"?"#ecfdf5":"#fff7ed",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"#6b7280",border:"1px solid #e5e7eb"}}>
              {s.label}
            </div>
          ))}
        </div>
        {/* Week labels */}
        <div style={{position:"relative",height:20,marginBottom:8,marginLeft:200}}>
          {weeks.map((w,i) => (
            <div key={i} style={{position:"absolute",left:`${((w-GANTT_START)/(GANTT_END-GANTT_START))*100}%`,fontSize:10,color:"#9ca3af",whiteSpace:"nowrap"}}>
              {w.toLocaleDateString("en-US",{month:"short",day:"numeric"})}
            </div>
          ))}
        </div>
        {/* Task rows */}
        {tasks.map(task => (
          <div key={task.id} style={{display:"flex",alignItems:"stretch",marginBottom:3,height:28}}>
            <div style={{width:200,flexShrink:0,fontSize:12,color:"#374151",paddingRight:12,display:"flex",alignItems:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}} title={task.name}>
              {task.name}
            </div>
            <div style={{flex:1,position:"relative",background:"#f9fafb",borderRadius:4,border:"1px solid #f3f4f6"}}>
              <GanttBar task={task} />
            </div>
          </div>
        ))}
        {/* Legend */}
        <div style={{display:"flex",gap:16,marginTop:12,marginLeft:200,flexWrap:"wrap"}}>
          {[["done","#059669","Done"],["prog","#2563eb","In progress"],["todo","#9ca3af","To do"],["block","#dc2626","Blocked"]].map(([,color,label])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#6b7280"}}>
              <div style={{width:16,height:8,borderRadius:2,background:color+"33",border:`1.5px solid ${color}`}}/>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState("tasks");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [ganttSprint, setGanttSprint] = useState("all");

  const metrics = {
    total: tasks.length,
    done: tasks.filter(t=>t.status==="done").length,
    prog: tasks.filter(t=>t.status==="prog").length,
    block: tasks.filter(t=>t.status==="block").length,
    pct: Math.round((tasks.filter(t=>t.status==="done").length / tasks.length) * 100),
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  const ganttTasks = ganttSprint === "all" ? tasks : tasks.filter(t => t.sprint === ganttSprint);

  function toggleDone(id) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t));
  }

  function addTasks(newTasks) {
    setTasks(ts => [...ts, ...newTasks]);
  }

  const TABS = [
    { id:"tasks",        label:"Tasks",        icon:"📋" },
    { id:"timeline",     label:"Timeline",     icon:"📅" },
    { id:"resources",    label:"Resources",    icon:"👥" },
    { id:"stakeholders", label:"Stakeholders", icon:"🏛" },
    { id:"terraform",    label:"Terraform",    icon:"</>" },
    { id:"github",       label:"GitHub",       icon:"⬡" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'DM Sans', -apple-system, sans-serif"}}>
      {showAddModal && <AddTaskModal onClose={()=>setShowAddModal(false)} onAdd={addTasks} />}

      {/* Header */}
      <header style={{background:"#fff",borderBottom:"1px solid #e5e7eb",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:32,height:32,background:"linear-gradient(135deg,#4285F4,#0F9D58)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>☁️</div>
            <div>
              <div style={{fontWeight:700,fontSize:15,letterSpacing:-0.3}}>GCP Project Planner</div>
              <div style={{fontSize:11,color:"#9ca3af"}}>project-id: gcp-platform-prod-2026</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:12,padding:"4px 10px",background:"#f0fdf4",color:"#15803d",borderRadius:20,fontWeight:500}}>Q2 2026</span>
            <button onClick={()=>setShowAddModal(true)}
              style={{padding:"7px 16px",background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              + Add Task
            </button>
          </div>
        </div>
      </header>

      <div style={{maxWidth:1280,margin:"0 auto",padding:"24px"}}>
        {/* Metrics */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:24}}>
          {[
            ["Total Tasks", metrics.total, "#1d4ed8"],
            ["Done", metrics.done, "#059669"],
            ["In Progress", metrics.prog, "#d97706"],
            ["Blocked", metrics.block, "#dc2626"],
            ["Complete", `${metrics.pct}%`, "#7c3aed"],
          ].map(([label, val, color]) => (
            <div key={label} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 18px"}}>
              <div style={{fontSize:11,color:"#9ca3af",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{label}</div>
              <div style={{fontSize:26,fontWeight:700,color}}>{val}</div>
              {label === "Complete" && (
                <div style={{marginTop:6,height:4,background:"#f3f4f6",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",background:color,borderRadius:2,width:`${metrics.pct}%`,transition:"width 0.6s"}} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:2,borderBottom:"1px solid #e5e7eb",marginBottom:20}}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              style={{padding:"10px 18px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:activeTab===t.id?600:400,color:activeTab===t.id?"#2563eb":"#6b7280",borderBottom:activeTab===t.id?"2px solid #2563eb":"2px solid transparent",display:"flex",alignItems:"center",gap:6}}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* TASKS */}
        {activeTab === "tasks" && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {[["all","All"],["todo","To do"],["prog","In progress"],["done","Done"],["block","Blocked"]].map(([k,l])=>(
                <button key={k} onClick={()=>setFilter(k)}
                  style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${filter===k?"#2563eb":"#e5e7eb"}`,background:filter===k?"#eff6ff":"transparent",color:filter===k?"#1d4ed8":"#6b7280",fontSize:12,cursor:"pointer",fontWeight:filter===k?600:400}}>
                  {l} {k!=="all" && <span style={{marginLeft:4,background:"#e5e7eb",borderRadius:10,padding:"1px 6px",fontSize:10,color:"#6b7280"}}>{tasks.filter(t=>t.status===k).length}</span>}
                </button>
              ))}
            </div>
            <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"32px 1fr 120px 130px 80px 100px 100px 90px",gap:10,padding:"10px 16px",background:"#f9fafb",borderBottom:"1px solid #e5e7eb",fontSize:11,color:"#9ca3af",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                <span/><span>Task</span><span>Category</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Dates</span><span>Sprint</span>
              </div>
              {filtered.map(task => {
                const res = RESOURCES.find(r=>r.name===task.assignee);
                const dl = daysLeft(task.end);
                return (
                  <div key={task.id} style={{display:"grid",gridTemplateColumns:"32px 1fr 120px 130px 80px 100px 100px 90px",gap:10,padding:"11px 16px",borderBottom:"1px solid #f3f4f6",alignItems:"center",fontSize:13}}>
                    <input type="checkbox" checked={task.status==="done"} onChange={()=>toggleDone(task.id)} style={{cursor:"pointer"}}/>
                    <span style={{fontWeight:500,textDecoration:task.status==="done"?"line-through":"none",color:task.status==="done"?"#9ca3af":"#111827"}}>{task.name}</span>
                    <Badge cat={task.cat}/>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      {res && <Avatar name={res.name} color={res.color} size={22}/>}
                      <span style={{fontSize:12,color:"#6b7280"}}>{task.assignee.split(" ")[0]}</span>
                    </div>
                    <PrioBadge prio={task.prio}/>
                    <StatusPill status={task.status}/>
                    <div style={{fontSize:11}}>
                      <div style={{color:"#374151"}}>{formatDate(task.start)}</div>
                      <div style={{color: dl < 0 && task.status!=="done" ? "#dc2626" : "#9ca3af"}}>→ {formatDate(task.end)}</div>
                    </div>
                    <span style={{fontSize:12,color:"#9ca3af",fontWeight:500}}>{task.sprint}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TIMELINE (GANTT) */}
        {activeTab === "timeline" && (
          <div>
            <div style={{marginBottom:16,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:13,color:"#6b7280",fontWeight:500}}>Filter sprint:</span>
              {[["all","All sprints"],...SPRINTS.map(s=>[s.id,s.label])].map(([k,l])=>(
                <button key={k} onClick={()=>setGanttSprint(k)}
                  style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${ganttSprint===k?"#2563eb":"#e5e7eb"}`,background:ganttSprint===k?"#eff6ff":"transparent",color:ganttSprint===k?"#1d4ed8":"#6b7280",fontSize:12,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>
            {/* Sprint overview */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
              {SPRINTS.map(s => {
                const sTasks = tasks.filter(t=>t.sprint===s.id);
                const sDone = sTasks.filter(t=>t.status==="done").length;
                return (
                  <div key={s.id} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#1d4ed8",marginBottom:2}}>{s.label}</div>
                    <div style={{fontSize:11,color:"#9ca3af",marginBottom:8}}>{formatDate(s.start)} — {formatDate(s.end)}</div>
                    <div style={{fontSize:11,color:"#374151",marginBottom:8,lineHeight:1.4}}>{s.goal}</div>
                    <div style={{height:4,background:"#f3f4f6",borderRadius:2}}>
                      <div style={{height:"100%",background:"#059669",borderRadius:2,width:`${sTasks.length?Math.round(sDone/sTasks.length*100):0}%`}}/>
                    </div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>{sDone}/{sTasks.length} tasks done</div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"20px"}}>
              <GanttChart tasks={ganttTasks} />
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {activeTab === "resources" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {RESOURCES.map(r => {
              const rTasks = tasks.filter(t=>t.assignee===r.name);
              const rDone = rTasks.filter(t=>t.status==="done").length;
              return (
                <div key={r.name} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"18px"}}>
                  <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
                    <Avatar name={r.name} color={r.color} size={44}/>
                    <div>
                      <div style={{fontWeight:600,fontSize:14}}>{r.name}</div>
                      <div style={{fontSize:12,color:"#9ca3af"}}>{r.role}</div>
                    </div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#6b7280",marginBottom:4}}>
                      <span>Allocation</span><span style={{fontWeight:600}}>{r.alloc}%</span>
                    </div>
                    <div style={{height:6,background:"#f3f4f6",borderRadius:3}}>
                      <div style={{height:"100%",background:r.color,borderRadius:3,width:`${r.alloc}%`,opacity:0.8}}/>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#6b7280",marginBottom:8}}>
                    <span>Tasks: <b style={{color:"#111"}}>{rTasks.length}</b></span>
                    <span>Done: <b style={{color:"#059669"}}>{rDone}</b></span>
                    <span>Active: <b style={{color:"#d97706"}}>{rTasks.filter(t=>t.status==="prog").length}</b></span>
                  </div>
                  <div style={{height:4,background:"#f3f4f6",borderRadius:2}}>
                    <div style={{height:"100%",background:"#059669",borderRadius:2,width:`${rTasks.length?Math.round(rDone/rTasks.length*100):0}%`}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STAKEHOLDERS */}
        {activeTab === "stakeholders" && (
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#f9fafb"}}>
                  {["Stakeholder","Role","Interest area","Notification","Terraform impact"].map(h=>(
                    <th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #e5e7eb"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAKEHOLDERS.map(s => (
                  <tr key={s.name} style={{borderBottom:"1px solid #f3f4f6"}}>
                    <td style={{padding:"12px 16px",fontWeight:600}}>{s.name}</td>
                    <td style={{padding:"12px 16px",color:"#6b7280"}}>{s.role}</td>
                    <td style={{padding:"12px 16px"}}>{s.interest}</td>
                    <td style={{padding:"12px 16px"}}><span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:"#eff6ff",color:"#1d4ed8",fontWeight:500}}>{s.notify}</span></td>
                    <td style={{padding:"12px 16px",fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{s.tf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TERRAFORM */}
        {activeTab === "terraform" && (
          <div>
            {[
              { title:"providers.tf + backend.tf", file:"Remote GCS state, provider pinning",
                code:`terraform {
  required_version = ">= 1.7"
  required_providers {
    google = { source = "hashicorp/google", version = "~> 5.0" }
  }
  backend "gcs" {
    bucket = "my-org-tf-state"
    prefix = "gcp-platform/state"
  }
}
provider "google" {
  project = var.project_id
  region  = var.region
}` },
              { title:"modules/networking/main.tf", file:"Shared VPC, subnets, Cloud NAT",
                code:`resource "google_compute_network" "vpc" {
  name                    = "platform-vpc-\${var.env}"
  auto_create_subnetworks = false
}
resource "google_compute_subnetwork" "gke" {
  name          = "gke-subnet-\${var.env}"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.id
  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.100.0.0/16"
  }
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.101.0.0/20"
  }
}` },
              { title:"modules/gke/main.tf", file:"GKE Autopilot, Workload Identity, private nodes",
                code:`resource "google_container_cluster" "main" {
  name             = "platform-gke-\${var.env}"
  location         = var.region
  enable_autopilot = true
  private_cluster_config {
    enable_private_nodes   = true
    master_ipv4_cidr_block = "172.16.0.0/28"
  }
  workload_identity_config {
    workload_pool = "\${var.project_id}.svc.id.goog"
  }
  network    = module.networking.vpc_id
  subnetwork = module.networking.gke_subnet_id
}` },
              { title:"modules/iam/main.tf", file:"Service accounts, Workload Identity bindings",
                code:`resource "google_service_account" "workload" {
  for_each     = toset(var.workloads)
  account_id   = "sa-\${each.key}"
  display_name = "\${each.key} workload SA"
}
resource "google_service_account_iam_member" "wi" {
  for_each           = google_service_account.workload
  service_account_id = each.value.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:\${var.project_id}.svc.id.goog[\${var.k8s_ns}/\${each.key}]"
}` },
              { title:"modules/cloudsql/main.tf", file:"PostgreSQL 15 HA, private IP, CMEK, backups",
                code:`resource "google_sql_database_instance" "main" {
  name             = "platform-pg-\${var.env}"
  database_version = "POSTGRES_15"
  deletion_protection = true
  settings {
    tier              = "db-custom-4-16384"
    availability_type = "REGIONAL"
    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
    }
    ip_configuration {
      ipv4_enabled    = false
      private_network = module.networking.vpc_id
    }
  }
  encryption_key_name = var.cmek_key_id
}` },
            ].map(b => (
              <div key={b.title} style={{background:"#1e1e2e",borderRadius:12,overflow:"hidden",marginBottom:14}}>
                <div style={{padding:"10px 16px",background:"#2a2a3e",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{b.title}</span>
                  <span style={{fontSize:11,color:"#64748b",fontFamily:"monospace"}}>{b.file}</span>
                </div>
                <pre style={{margin:0,padding:"16px",fontSize:12,lineHeight:1.7,color:"#a9b1d6",fontFamily:"'JetBrains Mono','Fira Code',monospace",overflowX:"auto"}}>
                  {b.code}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* GITHUB */}
        {activeTab === "github" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[
              { icon:"🌿", title:"Branching strategy", items:["main → protected, requires PR + 2 approvals","feat/TASK-ID branches per task card","env/staging and env/prod for promotion","Trunk-based, short-lived feature branches"] },
              { icon:"🛡", title:"CODEOWNERS & protection", items:["modules/iam/ → @security-team","modules/networking/ → @netops-team","Require terraform validate + tflint on PR","Block on Checkov HIGH severity findings"] },
              { icon:"⚙️", title:"CI — GitHub Actions", items:["terraform fmt -check on changed modules","terraform plan posted as PR comment","Checkov IaC security policy scan","OPA/Conftest org-policy compliance checks"] },
              { icon:"🚀", title:"CD — Deployment pipeline", items:["Staging: auto-deploy on merge to main","Prod: manual approval gate required","Slack/Teams notification per environment","Daily drift detection scheduled workflow"] },
              { icon:"📋", title:"Issues & project board", items:["Labels: infra/iam/net/sec/ci/mon + priority","Milestones = sprints (S1–S4)","Auto-close issues on linked PR merge","Weekly digest via GitHub Discussions"] },
              { icon:"🔔", title:"Stakeholder notifications", items:["CTO: weekly GH Actions summary report","Security: notify on IAM/VPC-SC PR merge","Finance: monthly cost label audit report","App teams: notify on GKE module changes"] },
            ].map(card => (
              <div key={card.title} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:20}}>{card.icon}</span>
                  <span style={{fontSize:14,fontWeight:600}}>{card.title}</span>
                </div>
                <ul style={{listStyle:"none",padding:0,margin:0}}>
                  {card.items.map((item,i) => (
                    <li key={i} style={{fontSize:12,color:"#6b7280",padding:"4px 0",borderBottom:i<card.items.length-1?"1px solid #f9fafb":"none",display:"flex",gap:8}}>
                      <span style={{color:"#d1d5db",flexShrink:0}}>›</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
