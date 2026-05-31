// js/modes/type.js
import { checkAnswer } from '../fuzzy.js';

export function render(container, card, onResult) {
  const { word } = card;
  let submitted = false;

  container.innerHTML = `
    <div class="card" style="text-align:center">
      <div class="tag">${word.pos}</div>
      <div class="flashcard-word" style="margin:20px 0">${word.es}</div>
      <p class="muted" style="margin-bottom:20px;font-style:italic">"${word.example}"</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <input
        id="type-input"
        class="input"
        type="text"
        placeholder="Type the English meaning…"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
      <button id="type-submit" class="btn btn-primary btn-full">Check</button>
    </div>

    <div id="type-feedback" style="display:none"></div>

    <button id="type-next" class="btn btn-secondary btn-full" style="display:none">Next →</button>
  `;

  const input    = container.querySelector('#type-input');
  const submit   = container.querySelector('#type-submit');
  const feedback = container.querySelector('#type-feedback');
  const next     = container.querySelector('#type-next');

  input.focus();

  let correct;

  function doSubmit() {
    if (submitted) return;
    const val = input.value.trim();
    if (!val) return;
    submitted = true;

    const result = checkAnswer(val, word.en);
    correct = result !== 'wrong';

    input.classList.add(correct ? 'correct' : 'wrong');
    submit.style.display = 'none';
    feedback.style.display = 'block';

    if (result === 'exact') {
      feedback.innerHTML = `<div class="feedback correct">Correct! <strong>${word.en}</strong></div>`;
    } else if (result === 'fuzzy') {
      feedback.innerHTML = `<div class="feedback correct">Close enough! The answer is <strong>${word.en}</strong></div>`;
    } else {
      feedback.innerHTML = `<div class="feedback wrong">The answer is <strong>${word.en}</strong></div>`;
    }

    next.style.display = 'block';
    next.focus();
    onResult({ correct, card });
  }

  submit.addEventListener('click', doSubmit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSubmit(); });
  next.addEventListener('click', () => onResult({ correct, card, advance: true }));
}
