let weeksData = null;
let currentIndex = 0;

const FALLBACK = {
  currentWeek: "2026-W44",
  weeks: [{
    id: "2026-W44", year: 2026, week: 44,
    startDate: "2026-11-01", endDate: "2026-11-07", label: "2026 第 44 周",
    fixedBreakfast: {
      name: "希腊酸奶高蛋白碗",
      items: [
        { name: "无糖希腊酸奶", amount: "200-250g" },
        { name: "低脂牛奶", amount: "200ml" },
        { name: "奇亚籽", amount: "10g" },
        { name: "燕麦 + 坚果", amount: "15-20g + 15-20g" }
      ],
      proteinTarget: "25–35g / 人",
      sequence: "先喝果蔬汁（空腹）→ 间隔20-30分钟 → 再吃高蛋白早餐"
    },
    days: [
      { day: "周一", date: "2026-11-02", name: "青绿补水美肌汁", ingredients: "黄瓜400g + 芹菜200g + 苹果200g + 柠檬1个 + 生姜15g", tags: ["美容补水", "低卡控糖", "轻体"] },
      { day: "周二", date: "2026-11-03", name: "胡萝卜暖橙代谢汁", ingredients: "胡萝卜400g + 橙子200g + 柠檬半个 + 生姜15g", tags: ["维A亮肤", "促代谢", "抗氧化"] },
      { day: "周三", date: "2026-11-04", name: "绿叶轻体汁", ingredients: "菠菜/羽衣甘蓝150g + 黄瓜300g + 苹果150g + 柠檬半个", tags: ["减肥轻体", "抗氧化", "美肤"] },
      { day: "周四", date: "2026-11-05", name: "甜菜循环美颜汁", ingredients: "甜菜根250g + 胡萝卜200g + 苹果150g + 柠檬半个", tags: ["血液循环", "抗氧化", "美颜"] },
      { day: "周五", date: "2026-11-06", name: "芹菜黄瓜排毒汁", ingredients: "芹菜250g + 黄瓜350g + 柠檬1个 + 生姜10g", tags: ["控糖", "利尿", "轻体"] },
      { day: "周六", date: "2026-11-07", name: "卷心菜纤维饱腹汁", ingredients: "卷心菜300g + 胡萝卜200g + 苹果150g + 生姜15g", tags: ["高纤维", "饱腹", "控糖"] },
      { day: "周日", date: "2026-11-01", name: "综合养颜控糖汁", ingredients: "黄瓜250g + 芹菜150g + 胡萝卜200g + 苹果100g + 柠檬半个", tags: ["综合美容", "控糖", "轻体"] }
    ],
    shopping: {
      sunday: ["苹果 1.6–1.8 kg（约8–10个）", "胡萝卜 1.8–2.0 kg", "黄瓜 1.8–2.0 kg（约7–8根）", "芹菜 800–1000 g（约2把）", "生姜 200–250 g", "柠檬 12个（约1.2–1.4 kg）", "甜菜根 600–700 g（约4–5个）", "菠菜/羽衣甘蓝 400–500 g（2包）", "卷心菜 1个（约1.0–1.2 kg）", "橙子 2–3个（可选）", "无糖希腊酸奶 1.5–2.0 kg", "低脂牛奶/植物奶 1.5–2.0 L", "奇亚籽 80–100 g", "燕麦 200 g", "坚果（核桃/杏仁）150 g"],
      wednesday: ["菠菜/羽衣甘蓝 300–400 g", "黄瓜 800–1000 g（约4根）", "芹菜 400–500 g（1把）", "柠檬 4–5个", "生姜 50–100 g（如需要）", "梨 4–5个（可选，约800g）"]
    }
  }]
};

async function loadData() {
  try {
    const res = await fetch("./data/weeks.json?t=" + Date.now());
    if (res.ok) weeksData = await res.json();
  } catch (e) {}
  if (!weeksData) weeksData = FALLBACK;

  const idx = weeksData.weeks.findIndex(w => w.id === weeksData.currentWeek);
  currentIndex = idx >= 0 ? idx : weeksData.weeks.length - 1;
  render();
}

function getCurrentWeek() { return weeksData.weeks[currentIndex]; }

function render() {
  const week = getCurrentWeek();
  if (!week) return;

  document.getElementById("week-label").textContent = week.label;
  document.getElementById("week-range").textContent = week.startDate + " ~ " + week.endDate;
  document.getElementById("prev-week").disabled = currentIndex <= 0;
  document.getElementById("next-week").disabled = currentIndex >= weeksData.weeks.length - 1;
  document.getElementById("current-badge").style.display = week.id === weeksData.currentWeek ? "inline-block" : "none";

  const chips = document.getElementById("date-chips");
  chips.innerHTML = week.days.map((d, i) =>
    `<button class="date-chip" data-idx="${i}"><span class="chip-day">${d.day}</span>${d.date.slice(5)}</button>`
  ).join("");
  chips.querySelectorAll(".date-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      chips.querySelectorAll(".date-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      highlightDay(+btn.dataset.idx);
    });
  });

  const formula = document.getElementById("breakfast-formula");
  formula.innerHTML = week.fixedBreakfast.items.map((it, i) => {
    const plus = i < week.fixedBreakfast.items.length - 1 ? '<span class="plus">+</span>' : "";
    return `<div class="item">${it.name}<br><small>${it.amount}</small></div>${plus}`;
  }).join("");
  document.getElementById("protein-target").innerHTML = `蛋白质目标：<strong>${week.fixedBreakfast.proteinTarget}</strong>`;
  document.getElementById("sequence").textContent = week.fixedBreakfast.sequence;

  document.getElementById("days-grid").innerHTML = week.days.map((d, i) => `
    <div class="day-card" id="day-${i}">
      <div class="day-name">${d.day}</div>
      <div class="date-str">${d.date}</div>
      <div class="juice-name">${d.name}</div>
      <div class="ingredients">${d.ingredients}</div>
      <div class="tags">${d.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
    </div>`).join("");

  renderTodo("todo-sun", week.shopping.sunday, "sun");
  renderTodo("todo-wed", week.shopping.wednesday, "wed");

  const list = document.getElementById("week-list");
  list.innerHTML = weeksData.weeks.map((w, i) =>
    `<button class="week-btn ${i === currentIndex ? "active" : ""}" data-idx="${i}">${w.label}</button>`
  ).join("");
  list.querySelectorAll(".week-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentIndex = +btn.dataset.idx;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderTodo(ulId, items, prefix) {
  const ul = document.getElementById(ulId);
  ul.innerHTML = items.map((text, i) => {
    const key = `todo-${prefix}-${currentIndex}-${i}`;
    const checked = localStorage.getItem(key) === "1" ? "checked" : "";
    return `<li><label><input type="checkbox" data-key="${key}" ${checked}> ${text}</label></li>`;
  }).join("");
  ul.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", () => localStorage.setItem(cb.dataset.key, cb.checked ? "1" : "0"));
  });
}

function highlightDay(idx) {
  document.querySelectorAll(".day-card").forEach(c => c.classList.remove("highlight"));
  const card = document.getElementById("day-" + idx);
  if (card) {
    card.classList.add("highlight");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("prev-week").addEventListener("click", () => {
    if (currentIndex > 0) { currentIndex--; render(); }
  });
  document.getElementById("next-week").addEventListener("click", () => {
    if (currentIndex < weeksData.weeks.length - 1) { currentIndex++; render(); }
  });
  document.getElementById("btn-today").addEventListener("click", () => {
    const idx = weeksData.weeks.findIndex(w => w.id === weeksData.currentWeek);
    if (idx >= 0) { currentIndex = idx; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });
});
