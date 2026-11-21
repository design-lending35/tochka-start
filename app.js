const firstQuestion = 'Каким был для тебя 2026 год по ощущениям?';
const firstAnswerKey = '0-1-0';
const firstGuide = 'Вспомни не только то, что произошло, но и то, как тебе жилось. Можно начать с одного слова или пары фраз.';
const firstExample = 'Год был насыщенным, но я часто уставала. Самыми тёплыми вспоминаются выходные, когда не нужно было никуда спешить.';
const promptExamples = {
  '0-1': firstExample,
  '9-0': 'Прогулки без телефона. Я замечала, что после них мне легче собраться с мыслями.'
};
const beforeStarting = [
  'Эта тетрадь — твоя точка старта. Он поможет осознанно закрыть прошлый год, извлечь уроки и спроектировать следующий год так, чтобы он был твоим.',
  '',
  'Работай с ним в тишине, без спешки.',
  'Можно пройти его за один раз, можно — за несколько подходов.',
  'Подготовь пространство. Убери лишнее.',
  'Возьми чай или кофе. Отключи уведомления.',
  'Сядь удобно. Закрой глаза. Сделай 5 глубоких вдохов и выдохов.',
  'Отпусти ожидания. Начинай, когда почувствуешь готовность.'
].join('\n');
const calendarGuide = 'Просмотри прошлый год неделя за неделей. Отметь важные события, значимые встречи, проекты и поворотные моменты. Запиши всё, что вспоминается. Не нужно искать точную формулировку. Начни с того, что первым приходит в голову.';

const life = ['Личная жизнь, семья','Карьера, обучение','Друзья, сообщество','Отдых, хобби, творчество','Физическое здоровье, спорт','Психология, самопознание','Привычки'];
const chapters = [
  ['Перед началом',beforeStarting,['Перелистай свой календарь',firstQuestion]],
  ['О чём был мой год','Посмотри на сферы жизни и напиши, что важного происходило в каждой.',life],
  ['Отпускание','',['Три вещи, которые я готов(а) отпустить, чтобы двигаться дальше','Три вещи, которым я готов(а) сказать «нет»'],3],
  ['Шесть важных моментов года','Ответь честно, без идеализации.',['Самое мудрое решение, которое я принял(а)','Самый большой урок','Самый крупный риск','Самый большой сюрприз','Самая важная вещь, которую я сделал(а) для других','Самое большое дело, которое я завершил(а)']],
  ['Шесть вопросов о годе','Ответь письменно, можно коротко.',['Чем я горжусь больше всего?','Какие три человека повлияли на меня сильнее всего?','На каких трёх людей больше всего повлиял(а) я?','Что у меня не получилось завершить?','Что лучшего я открыл(а) в себе?','За что я больше всего благодарен(а)?']],
  ['Лучшие моменты','Опиши свои самые тёплые воспоминания. Где ты был(а)? С кем? Что чувствовал(а)? Какие запахи, звуки, вкусы запомнились?',['Мои самые тёплые воспоминания']],
  ['Итог года','',[['Прошедший год в трёх словах',3],['Три моих главных достижения',3],'Книга или фильм моего года','Почему именно так?']],
  ['Прощание и прощение','Даже если не до конца готов(а) — просто напиши.',['Кому или чему я хочу сказать «прощай»?','Что я готов(а) простить — другим или себе?']],
  ['Шесть пожеланий себе','',['В этом году я не буду откладывать в долгий ящик'],6],
  ['Источники энергии','',['В этом году я буду черпать энергию из…','Я буду самым(ой) храбрым(ой), когда…','Я скажу «да», когда…','В этом году я советую себе…','Этот год будет для меня особенным, потому что…']],
  ['Волшебные тройки 2027','Заполняй интуитивно.',['Три вещи, которыми я создам уют вокруг себя','Три вещи, которые я буду делать каждое утро','Три способа регулярно баловать себя','Три места, где я побываю'],3],
  ['Волшебные тройки 2027 · продолжение','Заполняй интуитивно.',['Три способа поддерживать отношения с близкими','Три подарка, которыми я отблагодарю себя','Три вещи, которые я буду любить в себе','Три вещи, которые я решусь попробовать'],3],
  ['Цели по сферам жизни','Определи 1–3 ключевые цели в каждой сфере.',life],
  ['Мой вклад','',['Что я сделаю в 2027 году, чтобы мир стал хоть немного лучше?','Опиши свой идеальный 2027 год. Как ты живёшь? Как ты себя чувствуешь? Какие люди рядом? Что делает этот год по-настоящему твоим?']]
];
const parts = [
  { year:2026, title:'Год минувший', start:0, end:8, icon:'·' },
  { year:2027, title:'Год перед тобой', start:8, end:14, icon:'✧' }
];
const key = 'godovoy-kompas:2026-2027:v1';
const $ = (selector) => document.querySelector(selector);
let state = {answers:{},answerDates:{},done:[],current:null};
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && Array.isArray(saved.done) && saved.answers && (saved.current === null || Number.isInteger(saved.current))) state = saved;
} catch {
  storageAvailable = false;
}
state.answerDates ??= {};
const done = new Set(state.done.filter(index => Number.isInteger(index) && chapters[index]));
let visible;
let advanceTimer;
const pendingAnswerSaves = new Set();

function linkedAnswer(input, fieldId, panel) {
  const status = panel.querySelector('[role="status"]');
  const retry = panel.querySelector('.retry');
  input.value = state.answers[fieldId] ?? '';
  if (input.value.trim()) status.textContent = 'Ответ сохранён';
  let statusTimer;

  function persist() {
    clearTimeout(statusTimer);
    status.textContent = 'Сохраняем…';
    retry.hidden = true;
    save();
    if (storageAvailable) {
      statusTimer = setTimeout(() => {
        status.textContent = input.value.trim() ? 'Ответ сохранён' : '';
      }, 180);
    } else {
      pendingAnswerSaves.add(fieldId);
      status.textContent = 'Не удалось сохранить ответ. Текст пока в поле. Попробуй ещё раз';
      retry.hidden = false;
    }
    updateStart();
  }

  input.addEventListener('input', () => {
    state.answers[fieldId] = input.value;
    if (input.value.trim()) {
      state.answerDates[fieldId] = new Date().toISOString();
    } else {
      delete state.answerDates[fieldId];
    }
    persist();
  });
  retry.addEventListener('click', persist);
  return () => {
    clearTimeout(statusTimer);
    input.value = state.answers[fieldId] ?? '';
    retry.hidden = !pendingAnswerSaves.has(fieldId);
    status.textContent = retry.hidden
      ? (input.value.trim() ? 'Ответ сохранён' : '')
      : 'Не удалось сохранить ответ. Текст пока в поле. Попробуй ещё раз';
  };
}


function save() {
  state.done = [...done];
  try {
    localStorage.setItem(key, JSON.stringify(state));
    pendingAnswerSaves.clear();
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
}

function updateProgress(celebrate = false) {
  const count = done.size;
  document.querySelectorAll('[data-progress-count]').forEach(el => el.textContent = count + ' из ' + chapters.length);
  document.querySelectorAll('[data-progress]').forEach(el => {
    el.setAttribute('aria-valuenow', count);
    el.firstElementChild.style.width = count / chapters.length * 100 + '%';
    el.closest('.progress').classList.toggle('started', count > 0);
  });
  if (celebrate) {
    $('#progress-status').textContent = 'Раздел завершён. Прогресс: ' + count + ' из ' + chapters.length;
    document.querySelectorAll('.completion-star').forEach(star => {
      star.classList.remove('spark');
      void star.offsetWidth;
      star.classList.add('spark');
    });
  }
  document.querySelectorAll('[data-part-count]').forEach(el => {
    const part = parts[Number(el.dataset.partCount)];
    const complete = [...done].filter(index => index >= part.start && index < part.end).length;
    el.textContent = complete + ' из ' + (part.end - part.start) + ' разделов';
  });
  document.querySelectorAll('[data-chapter-done]').forEach(el => {
    el.hidden = !done.has(Number(el.dataset.chapterDone));
  });
  updateStart();
}

function updateStart() {
  const resume = chapters[state.current] ? '#chapter-' + state.current : '#sections';
  const answers = Object.values(state.answers).some(answer => typeof answer === 'string' && answer.trim());
  $('#start').href = answers ? resume : '#first-question';
  $('#start').textContent = answers ? 'Продолжить тетрадь' : 'Ответить на первый вопрос';
  $('#start-hint').textContent = answers
    ? 'Продолжи с того места, где остановилась, или выбери другой раздел'
    : 'Можно начать с пары минут и одного вопроса';
  $('#nav-work').href = chapters[state.current] ? resume : '#chapter-0';
  $('#home-final').hidden = done.size < chapters.length;
}

function renderNavigation(index) {
  $('#chapters').innerHTML = parts.map(part => '<p class="nav-heading">' + part.year + ' · ' + part.title + '</p>' +
    chapters.slice(part.start, part.end).map(([title], offset) => {
      const id = part.start + offset;
      return '<a href="#chapter-' + id + '"' + (id === index ? ' aria-current="page"' : '') + '>' + title +
        (done.has(id) ? '<span role="img" aria-label="Завершён">·</span>' : '') + '</a>';
    }).join('')).join('');
  const picker = $('#chapters-mobile');
  picker.innerHTML = chapters.map(([title], id) => '<option value="' + id + '">' + (done.has(id) ? '· ' : '') + title + '</option>').join('');
  picker.value = index;
}

function renderExercise(index) {
  const [title, intro, prompts, defaultCount = 1] = chapters[index];
  const part = parts[index < 8 ? 0 : 1];
  const container = $('#exercise');
  container.innerHTML = '<div class="exercise-panel"><p class="eyebrow"><span></span>' + part.title + ' · ' + part.year +
    '</p><h1 tabindex="-1">' + title + '</h1>' + (intro ? '<p class="intro">' + intro + '</p>' : '') +
    '<div class="fields"></div><div class="progress exercise-progress">' +
    '<div class="progress-label"><span>Прогресс <span class="completion-star" aria-hidden="true">·</span></span><strong data-progress-count></strong></div>' +
    '<div class="progress-track" data-progress role="progressbar" aria-label="Прогресс тетради" aria-valuemin="0" aria-valuemax="14"><div></div></div></div>' +
    '<div class="exercise-actions"></div>' + (prompts.length >= 5
      ? '<p class="save-note">Можно остановиться здесь и вернуться позже</p>' : '') + '</div>';
  const fields = container.querySelector('.fields');
  const order = index === 0 ? [1, 0] : prompts.map((_, position) => position);
  order.forEach(position => {
    const entry = prompts[position];
    const [prompt, repeats] = Array.isArray(entry) ? entry : [entry, defaultCount];
    const field = document.createElement(repeats > 1 ? 'fieldset' : 'div');
    field.className = 'field';
    const label = document.createElement(repeats > 1 ? 'legend' : 'label');
    label.textContent = prompt;
    field.append(label);
    const guideText = index === 0 ? (position === 0 ? calendarGuide : firstGuide) : '';
    if (guideText) {
      const guide = document.createElement('p');
      guide.className = 'field-guide';
      guide.id = 'guide-' + index + '-' + position;
      guide.textContent = guideText;
      field.append(guide);
    }
    const example = promptExamples[index + '-' + position];
    if (example) {
      const details = document.createElement('details');
      details.className = 'example';
      const summary = document.createElement('summary');
      const paragraph = document.createElement('p');
      summary.textContent = 'Посмотреть пример';
      paragraph.textContent = example;
      details.append(summary, paragraph);
      field.append(details);
    }
    for (let n = 0; n < repeats; n++) {
      const fieldId = index + '-' + position + '-' + n;
      const input = document.createElement('textarea');
      input.id = 'field-' + fieldId;
      const statusId = 'status-' + fieldId;
      const description = guideText ? 'guide-' + index + '-' + position + ' ' + statusId : statusId;
      input.setAttribute('aria-describedby', description);
      input.rows = repeats > 1 ? 1 : 3;
      input.placeholder = repeats > 1 ? (n + 1) + '. Напиши здесь…' : 'Напиши здесь…';
      if (repeats > 1) {
        input.className = 'short';
        input.setAttribute('aria-label', prompt + ' — ответ ' + (n + 1));
      } else {
        label.htmlFor = input.id;
      }
      const status = document.createElement('div');
      status.className = 'field-status';
      status.innerHTML = '<p role="status" id="' + statusId + '"></p>' +
        '<button type="button" class="text-button retry" hidden>Повторить</button>';
      field.append(input, status);
      linkedAnswer(input, fieldId, status)();
    }
    fields.append(field);
  });

  const actions = container.querySelector('.exercise-actions');
  const complete = document.createElement('button');
  complete.className = 'button primary';
  complete.textContent = done.has(index) ? 'Продолжить' : 'Завершить раздел';
  complete.addEventListener('click', () => {
    const isNew = !done.has(index);
    done.add(index);
    save();
    renderNavigation(index);
    updateProgress(isNew);
    const next = chapters.findIndex((_, id) => id > index && !done.has(id));
    const pending = next < 0 ? chapters.findIndex((_, id) => !done.has(id)) : next;
    const target = pending < 0 ? '#final' : '#chapter-' + (isNew ? pending : index < chapters.length - 1 ? index + 1 : pending);
    if (!isNew) {
      location.hash = target;
      return;
    }
    complete.disabled = true;
    complete.textContent = 'Раздел завершён ·';
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 90 : 1150;
    advanceTimer = setTimeout(() => location.hash = target, duration);
  });
  actions.append(complete);
  const skip = document.createElement('a');
  skip.className = 'button secondary';
  skip.href = index + 1 < chapters.length ? '#chapter-' + (index + 1) : '#sections';
  skip.textContent = 'Пропустить пока';
  actions.append(skip);
  if (index > 0) {
    const back = document.createElement('a');
    back.className = 'button secondary';
    back.href = '#chapter-' + (index - 1);
    back.textContent = 'Предыдущий раздел';
    actions.append(back);
  }
  const download = document.createElement('button');
  download.className = 'button secondary exercise-pdf';
  download.type = 'button';
  download.dataset.download = '';
  download.textContent = 'Скачать PDF';
  actions.append(download);

}

function route() {
  clearTimeout(advanceTimer);
  const hash = location.hash;
  const match = /^#chapter-(\d+)$/.exec(hash);
  const requested = match ? Number(match[1]) : null;
  const index = requested !== null && chapters[requested] ? requested : null;
  const final = hash === '#final' && done.size === chapters.length;
  if (hash === '#final' && !final) {
    location.replace('#chapter-' + chapters.findIndex((_, id) => !done.has(id)));
    return;
  }
  const view = final ? 'final' : index !== null ? 'workbook' : 'home';
  ['home','workbook','final'].forEach(id => $('#' + id).hidden = id !== view);
  $('#nav-home').toggleAttribute('aria-current', view === 'home');
  $('#nav-work').toggleAttribute('aria-current', view !== 'home');
  (view === 'home' ? $('#nav-home') : $('#nav-work')).setAttribute('aria-current', 'page');
  if (index !== null) {
    state.current = index;
    save();
    renderNavigation(index);
    renderExercise(index);
  }
  const stage = $('.final-stage');
  stage.classList.toggle('play', final);
  if (view === 'home') refreshFirstAnswer();
  if (view === 'home' && ['#first-question','#sections'].includes(hash)) {
    const target = $(hash);
    target.scrollIntoView({block:'start'});
    target.querySelector('h2').focus({preventScroll:true});
  } else if (visible !== undefined || view !== 'home') {
    window.scrollTo(0, 0);
    if (index !== null) $('#exercise h1').focus({preventScroll:true});
    if (final) $('#final-title').focus({preventScroll:true});
  }
  visible = view;
  updateProgress();
}

$('#parts').innerHTML = parts.map((part,index) =>
  '<section class="part"><span class="eyebrow">' + part.year + '</span><h3>' + part.title +
  '</h3><p data-part-count="' + index + '"></p><ul>' +
  chapters.slice(part.start, part.end).map(([title],offset) => {
    const id = part.start + offset;
    return '<li><a href="#chapter-' + id + '">' + title +
      '<span class="chapter-done" data-chapter-done="' + id + '" aria-label="Раздел завершён" hidden>✓</span></a></li>';
  }).join('') + '</ul></section>').join('');
const refreshFirstAnswer = linkedAnswer($('#first-answer'), firstAnswerKey, $('.question-answer'));
$('#chapters-mobile').addEventListener('change', event => location.hash = '#chapter-' + event.target.value);
window.addEventListener('hashchange', route);
route();

const pdfDate = new Intl.DateTimeFormat('ru-RU', {
  dateStyle:'long',
  timeZone:'Europe/Moscow'
});

function workbookPdf(answers, completed, answerDates, exportedAt = new Date()) {
  const answerDays = Object.entries(answerDates)
    .filter(([key, date]) => answers[key]?.trim() && Number.isFinite(Date.parse(date)))
    .map(([, date]) => new Date(date))
    .sort((a, b) => a - b);
  const firstDay = answerDays.length ? pdfDate.format(answerDays[0]) : '';
  const lastDay = answerDays.length ? pdfDate.format(answerDays.at(-1)) : '';
  const content = [
    {text:'Личная тетрадь · 2026–2027',style:'coverLabel',margin:[0,135,0,20]},
    {text:'Точка старта',style:'coverTitle'},
    {text:'Для себя',style:'coverSubtitle'},
    {text:'·',alignment:'center',fontSize:46,color:'#4E0000',margin:[0,0,0,30]}
  ];
  if (firstDay) {
    content.push({text:'Даты ответов: ' + (firstDay === lastDay ? firstDay : firstDay + ' — ' + lastDay),style:'coverLabel'});
  }
  content.push(
    {text:'Разделы завершены: ' + completed.size + ' из ' + chapters.length,style:'coverLabel'},
    {text:'Дата выгрузки: ' + pdfDate.format(exportedAt),style:'coverLabel'}
  );

  chapters.forEach(([title, intro, prompts, defaultCount = 1], index) => {
    const part = parts[index < parts[1].start ? 0 : 1];
    content.push({
      text:part.title + ' · ' + part.year + (completed.has(index) ? '   /   Раздел завершён' : ''),
      style:'part',
      pageBreak:'before'
    }, {text:title,style:'heading'});
    if (intro) content.push({text:intro,style:'intro'});
    const order = index === 0 ? [1, 0] : prompts.map((_, position) => position);
    order.forEach(position => {
      const entry = prompts[position];
      const [prompt, count] = Array.isArray(entry) ? entry : [entry, defaultCount];
      content.push({text:prompt,style:'prompt',headlineLevel:1});
      if (index === 0) content.push({text:position === 0 ? calendarGuide : firstGuide,style:'intro'});
      for (let n = 0; n < count; n++) {
        const key = index + '-' + position + '-' + n;
        const answer = answers[key];
        const prefix = count > 1 ? (n + 1) + '. ' : '';
        if (answer?.trim()) {
          const timestamp = Date.parse(answerDates[key]);
          const date = Number.isFinite(timestamp) ? pdfDate.format(timestamp) : 'дата записи не сохранена';
          content.push({text:prefix + date,style:'answerDate',headlineLevel:1});
          content.push({text:answer,style:'answer'});
        } else {
          content.push({text:prefix + '—',style:'answer'});
        }
      }
    });
  });

  if (completed.size === chapters.length) {
    content.push(
      {text:'Ты выбрал(а) направление.',style:'heading',pageBreak:'before'},
      {text:'Ты подвёл(а) итоги. Ты увидел(а) путь.',style:'intro'},
      {text:'Сделай глубокий вдох. Поблагодари себя.\nТы готов(а) идти дальше.',style:'answer'}
    );
  }

  return {
    info:{title:'Точка старта · Для себя | 2026–2027'},
    pageSize:'A4',
    pageMargins:[46,44,46,51],
    background:(_, size) => ({
      canvas:[{type:'rect',x:0,y:0,w:size.width,h:size.height,color:'#F1E8DE'}]
    }),
    footer:(page, total) => ({
      columns:[{text:'Точка старта'},{text:page + ' / ' + total,alignment:'right'}],
      margin:[46,15,46,0],
      color:'#694634',
      fontSize:9
    }),
    pageBreakBefore:(node, following) => node.headlineLevel === 1 && following.length === 0,
    defaultStyle:{font:'Roboto',fontSize:11,color:'#13273F',lineHeight:1.22},
    styles:{
      coverLabel:{alignment:'center',fontSize:11,color:'#4E0000',margin:[0,0,0,8]},
      coverTitle:{alignment:'center',fontSize:36,bold:true,margin:[0,0,0,8]},
      coverSubtitle:{alignment:'center',fontSize:14,color:'#4E0000',margin:[0,0,0,25]},
      part:{fontSize:10,bold:true,color:'#4E0000',margin:[0,0,0,8]},
      heading:{fontSize:26,bold:true,margin:[0,0,0,16]},
      intro:{color:'#694634',margin:[0,0,0,12]},
      prompt:{bold:true,margin:[0,12,0,5]},
      answerDate:{fontSize:9,color:'#4E0000',margin:[0,0,0,3]},
      answer:{margin:[0,0,0,8]}
    },
    content
  };
}

function loadPdfScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.onload = resolve;
    script.onerror = () => {
      script.remove();
      reject(new Error('PDF library failed to load'));
    };
    document.head.append(script);
  });
}

let pdfReady;
let downloading = false;
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-download]');
  if (!button || downloading) return;
  downloading = true;
  button.disabled = true;
  button.textContent = 'Готовим PDF…';
  const status = $('#download-status');
  status.hidden = true;
  status.textContent = '';
  try {
    if (!pdfReady) {
      pdfReady = (async () => {
        if (!window.pdfMake) await loadPdfScript('./vendor/pdfmake.min.js');
        await loadPdfScript('./vendor/vfs_fonts.js');
      })().catch(error => {
        pdfReady = undefined;
        throw error;
      });
    }
    await pdfReady;
    const pdf = window.pdfMake.createPdf(workbookPdf(state.answers, done, state.answerDates));
    const blob = await new Promise(resolve => pdf.getBlob(resolve));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Точка старта — мои ответы.pdf';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    status.textContent = 'Не удалось подготовить PDF. Попробуй скачать ещё раз.';
    status.hidden = false;
  } finally {
    downloading = false;
    button.disabled = false;
    button.textContent = 'Скачать PDF';
  }
});
