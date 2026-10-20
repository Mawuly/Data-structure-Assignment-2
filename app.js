// Print spooler UI. Uses the Queue class from queue.js.
const queue = new Queue();
let nextId = 1, jobsPrinted = 0, pagesPrinted = 0;
let busy = false, running = false;

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const speed = () => parseInt($('speed').value, 10);

const NAMES = ['Ama', 'Kofi', 'Esi', 'Yaw', 'Abena', 'Kwame', 'Akua', 'Nana'];
const DOCS = ['Assignment.docx', 'Lab_Report.pdf', 'Poster.pptx', 'Notes.txt', 'Project.pdf', 'Timetable.xlsx', 'Essay.docx'];
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- small UI helpers ---------- */
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  $('toasts').appendChild(t);
  setTimeout(() => t.remove(), 2900);
}

function log(kind, msg) {
  const ul = $('log');
  if (ul.querySelector('.none')) ul.innerHTML = '';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  ul.insertAdjacentHTML('afterbegin',
    `<li><span class="tag t-${kind.toLowerCase()}">${kind}</span>${esc(msg)}<span class="time">${time}</span></li>`);
  while (ul.children.length > 40) ul.lastChild.remove();
}

function setNum(id, value) {
  const el = $(id), card = el.parentElement;
  const from = parseInt(el.textContent, 10) || 0;
  if (from === value) { el.textContent = value; return; }
  card.classList.remove('bump'); void card.offsetWidth; card.classList.add('bump');
  const start = performance.now(), dur = 350;
  (function step(now) {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = Math.round(from + (value - from) * p);
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

/* ---------- rendering ---------- */
function render(newId) {
  const jobs = queue.toArray();
  $('track').innerHTML = jobs.length
    ? jobs.map((j, i) =>
        `<div class="job${i === 0 ? ' front' : ''}${i === jobs.length - 1 ? ' rear' : ''}${j.id === newId ? ' enter' : ''}" data-id="${j.id}">
           <div class="id">#${j.id}</div><div class="nm" title="${esc(j.doc)}">${esc(j.doc)}</div>
           <div class="pg">${esc(j.user)}, ${j.pages} pg</div></div>`).join('')
    : '<div class="empty">The queue is empty. Enqueue a job to begin.</div>';
  setNum('sWait', queue.length);
  setNum('sDone', jobsPrinted);
  setNum('sPages', pagesPrinted);
  $('sNext').textContent = queue.isEmpty() ? 'none' : '#' + queue.peek().id;
  $('next').disabled = busy || queue.isEmpty();
  $('all').disabled = !running && (busy || queue.isEmpty());
  $('all').textContent = running ? 'Pause' : 'Print all';
  $('peek').disabled = queue.isEmpty();
  $('clear').disabled = busy || queue.isEmpty();
}

/* ---------- queue operations ---------- */
function enqueue(user, doc, pages) {
  const job = { id: nextId++, user, doc, pages };
  queue.enqueue(job);
  log('ENQUEUE', `#${job.id} ${job.doc} (${job.pages} pages) added at the rear`);
  render(job.id);
  return job;
}

async function processNext() {
  if (busy || queue.isEmpty()) return;
  busy = true; render();
  const front = $('track').querySelector('.job.front');
  if (front) { front.classList.remove('enter'); front.classList.add('leave'); await sleep(450); }
  const job = queue.dequeue();
  log('DEQUEUE', `#${job.id} ${job.doc} removed from the front`);
  render();

  const printer = $('printer');
  printer.classList.add('printing');
  $('pState').textContent = 'Printing';
  for (let p = 1; p <= job.pages; p++) {
    $('pInfo').textContent = `#${job.id} ${job.doc}, page ${p} of ${job.pages}`;
    $('bar').style.width = (p / job.pages * 100) + '%';
    await sleep(speed());
    pagesPrinted++; setNum('sPages', pagesPrinted);
  }
  printer.classList.remove('printing');
  $('pState').textContent = 'Idle'; $('pInfo').textContent = 'Waiting for a job';
  $('bar').style.width = '0';
  jobsPrinted++;
  const done = $('done');
  if (done.querySelector('.none')) done.innerHTML = '';
  done.insertAdjacentHTML('afterbegin', `<li>#${job.id} ${esc(job.doc)} for ${esc(job.user)} (${job.pages} pages)</li>`);
  toast(`Finished #${job.id} ${job.doc}`);
  busy = false; render();
}

async function printAll() {
  if (running) { running = false; render(); return; }
  running = true; render();
  while (running && !queue.isEmpty()) await processNext();
  running = false; render();
}

function peek() {
  const job = queue.peek();
  if (!job) return;
  const el = $('track').querySelector('.job.front');
  if (el) { el.classList.remove('peek'); void el.offsetWidth; el.classList.add('peek'); }
  log('PEEK', `Front is #${job.id} ${job.doc} (not removed)`);
  toast(`Peek: #${job.id} ${job.doc} is at the front`);
}

function clearQueue() {
  const n = queue.length;
  queue.clear(); log('INFO', `Queue cleared (${n} jobs removed)`); render();
}

/* ---------- sample jobs (added to the queue only; nothing prints automatically) ---------- */
async function loadSamples() {
  $('sample').disabled = true;
  for (let i = 0; i < 3; i++) {
    enqueue(pick(NAMES), pick(DOCS), 1 + Math.floor(Math.random() * 5));
    await sleep(300);
  }
  $('sample').disabled = false;
  toast('3 sample jobs added. Use Dequeue & print to print them.');
}

/* ---------- events ---------- */
$('add').onclick = () => {
  const user = $('user'), doc = $('doc'), pages = $('pages');
  const p = parseInt(pages.value, 10);
  [user, doc, pages].forEach(i => i.classList.remove('bad'));
  let msg = '';
  if (!user.value.trim()) { user.classList.add('bad'); msg = 'Enter a student name.'; }
  else if (!doc.value.trim()) { doc.classList.add('bad'); msg = 'Enter a document name.'; }
  else if (!(p >= 1 && p <= 30)) { pages.classList.add('bad'); msg = 'Pages must be a whole number from 1 to 30.'; }
  $('err').textContent = msg;
  if (msg) return;
  const job = enqueue(user.value.trim(), doc.value.trim(), p);
  toast(`Enqueued #${job.id} ${job.doc}`);
  doc.value = ''; doc.focus();
};
['user', 'doc', 'pages'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') $('add').click(); }));
$('next').onclick = processNext;
$('all').onclick = printAll;
$('peek').onclick = peek;
$('clear').onclick = clearQueue;
$('sample').onclick = loadSamples;
$('speed').onchange = () => document.documentElement.style.setProperty('--pt', speed() + 'ms');

document.documentElement.style.setProperty('--pt', speed() + 'ms');
// Start with three sample jobs so the page is not empty
[['Ama', 'Assignment.docx', 5], ['Kofi', 'Lab_Report.pdf', 3], ['Esi', 'Poster.pptx', 2]]
  .forEach(([u, d, p]) => enqueue(u, d, p));
render();
