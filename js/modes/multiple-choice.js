// js/modes/multiple-choice.js
import { WORDS } from '../words.js';

function pickDistractors(correct, allWords, count = 3) {
  const pool = allWords.filter(w => w.en !== correct.en);
  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function render(container, card, onResult) {
  const { word } = card;
  const distractors = pickDistractors(word, WORDS);
  const options = shuffle([word, ...distractors]);
  let answered = false;

  const optionsHtml = options.map((w, i) => `
    <button class="mc-option" data-id="${w.id}" data-correct="${w.id === word.id}">
      <strong>${String.fromCharCode(65 + i)}.</strong> ${w.en}
    </button>
  `).join('');

  container.innerHTML = `
    <div class="card" style="text-align:center">
      <div class="tag">${word.pos}</div>
      <div class="flashcard-word" style="margin:20px 0">${word.es}</div>
    </div>

    <div class="mc-options">${optionsHtml}</div>

    <button id="mc-next" class="btn btn-secondary btn-full" style="display:none">Next →</button>
  `;

  const nextBtn = container.querySelector('#mc-next');

  function handleKey(e) {
    const idx = parseInt(e.key) - 1;
    const btns = [...container.querySelectorAll('.mc-option')];
    if (idx >= 0 && idx < btns.length && !answered) {
      btns[idx].click();
    }
  }
  document.addEventListener('keydown', handleKey);

  const observer = new MutationObserver(() => {
    if (!document.contains(container)) {
      document.removeEventListener('keydown', handleKey);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  container.querySelectorAll('.mc-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const correct = btn.dataset.correct === 'true';

      container.querySelectorAll('.mc-option').forEach(b => {
        b.disabled = true;
        if (b.dataset.correct === 'true') b.classList.add('correct');
        else if (b === btn && !correct)   b.classList.add('wrong');
      });

      nextBtn.style.display = 'block';
      nextBtn.focus();
      onResult({ correct, card });
    });
  });

  nextBtn.addEventListener('click', () => onResult({ correct: answered, card, advance: true }));
}
