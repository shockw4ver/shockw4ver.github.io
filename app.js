let weeksData = null;
let currentIndex = 0;

async function loadData() {
  try {
    const res = await fetch("./data/weeks.json?t=" + Date.now(), {cache:"no-store"});
    if (res.ok) weeksData = await res.json();
  } catch (e) { console.error("计划数据加载失败", e); }
  if (!weeksData || !Array.isArray(weeksData.weeks) || !weeksData.weeks.length) {
    document.getElementById("week-label").textContent = "计划暂时无法加载";
    return;
  }
  const idx = weeksData.weeks.findIndex(w => w.id === weeksData.currentWeek);
  currentIndex = idx >= 0 ? idx : weeksData.weeks.length - 1;
  render();
}
function getCurrentWeek(){ return weeksData.weeks[currentIndex]; }
function render(){
  const week=getCurrentWeek(); if(!week)return;
  document.getElementById("week-label").textContent=week.label;
  document.getElementById("week-range").textContent=week.startDate+" ~ "+week.endDate;
  document.getElementById("prev-week").disabled=currentIndex<=0;
  document.getElementById("next-week").disabled=currentIndex>=weeksData.weeks.length-1;
  document.getElementById("current-badge").style.display=week.id===weeksData.currentWeek?"inline-block":"none";

  const chips=document.getElementById("date-chips");
  chips.innerHTML=week.days.map((d,i)=>`<button class="date-chip" data-idx="${i}"><span class="chip-day">${d.day}</span>${d.date.slice(5)}</button>`).join("");
  chips.querySelectorAll(".date-chip").forEach(btn=>btn.addEventListener("click",()=>{
    chips.querySelectorAll(".date-chip").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active"); highlightDay(+btn.dataset.idx);
  }));

  document.getElementById("breakfast-formula").innerHTML=week.fixedBreakfast.items.map((it,i)=>
    `<div class="item">${it.name}<br><small>${it.amount}</small></div>${i<week.fixedBreakfast.items.length-1?'<span class="plus">+</span>':""}`
  ).join("");
  document.getElementById("protein-target").innerHTML=`蛋白质参考：<strong>${week.fixedBreakfast.proteinTarget}</strong>`;
  document.getElementById("sequence").textContent=week.fixedBreakfast.sequence;

  document.getElementById("days-grid").innerHTML=week.days.map((d,i)=>`
    <article class="day-card" id="day-${i}">
      <div class="day-name">${d.day}</div><div class="date-str">${d.date}</div>
      <div class="juice-name">${d.name}</div><div class="ingredients">${d.ingredients}</div>
      <div class="day-meta">${d.volume||""}</div>
      <div class="tags">${d.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
      <p class="day-note">${d.note||""}</p>
    </article>`).join("");

  renderTodo("todo-sun",week.shopping.sunday,"sun");
  renderTodo("todo-wed",week.shopping.wednesday,"wed");
  const list=document.getElementById("week-list");
  list.innerHTML=weeksData.weeks.map((w,i)=>`<button class="week-btn ${i===currentIndex?"active":""}" data-idx="${i}">${w.label}</button>`).join("");
  list.querySelectorAll(".week-btn").forEach(btn=>btn.addEventListener("click",()=>{
    currentIndex=+btn.dataset.idx;render();window.scrollTo({top:0,behavior:"smooth"});
  }));
  const routine=document.getElementById("morning-routine");
  if(routine)routine.innerHTML=(week.routine||[]).map(x=>`<li>${x}</li>`).join("");
}
function renderTodo(id,items,prefix){
  const ul=document.getElementById(id);
  ul.innerHTML=items.map((item,i)=>{
    const key=`todo-${prefix}-${currentIndex}-${i}`;
    const checked=localStorage.getItem(key)==="1"?"checked":"";
    return `<li><label><input type="checkbox" data-key="${key}" ${checked}> ${item}</label></li>`;
  }).join("");
  ul.querySelectorAll('input[type="checkbox"]').forEach(cb=>cb.addEventListener("change",()=>{
    localStorage.setItem(cb.dataset.key,cb.checked?"1":"0");
  }));
}
function highlightDay(idx){
  document.querySelectorAll(".day-card").forEach(c=>c.classList.remove("highlight"));
  const card=document.getElementById("day-"+idx);
  if(card){card.classList.add("highlight");card.scrollIntoView({behavior:"smooth",block:"center"});}
}
document.addEventListener("DOMContentLoaded",()=>{
  loadData();
  document.getElementById("prev-week").addEventListener("click",()=>{if(currentIndex>0){currentIndex--;render();}});
  document.getElementById("next-week").addEventListener("click",()=>{if(currentIndex<weeksData.weeks.length-1){currentIndex++;render();}});
  document.getElementById("btn-today").addEventListener("click",()=>{
    const idx=weeksData.weeks.findIndex(w=>w.id===weeksData.currentWeek);
    if(idx>=0){currentIndex=idx;render();window.scrollTo({top:0,behavior:"smooth"});}
  });
});
