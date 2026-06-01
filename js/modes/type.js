// js/modes/type.js
import { checkAnswer }    from '../fuzzy.js';
import { lookupSentence } from '../word-index.js';

function highlightWord(sentence, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return sentence.replace(new RegExp(`(${escaped})`, 'gi'), '<strong>$1</strong>');
}

export async function render(container, card, onResult, allWords, direction = 'es-en') {
  const { word } = card;
  const enEs = direction === 'en-es';
  let submitted = false;

  const bookSentence = await lookupSentence(word.es);
  const rawSentence = bookSentence || word.example || null;
  const contextHtml = rawSentence
    ? `<p class="book-sentence" style="margin-bottom:16px">«${highlightWord(rawSentence, word.es)}»</p>`
    : '';

  // In EN→ES mode, book sentence reveals the Spanish answer — show after submission only
  const cardContextHtml = enEs ? '' : contextHtml;

  container.innerHTML = `
    <div class="card" style="text-align:center;padding:20px 28px">
      <!-- <div class="tag">${word.pos}</div> -->
      <div class="flashcard-word" style="margin:12px 0 8px">${enEs ? word.en : word.es}</div>
      ${cardContextHtml}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <input
        id="type-input"
        class="input"
        type="text"
        placeholder="${enEs ? 'Type the Spanish word…' : 'Type the English meaning…'}"
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
  const correctAnswer = enEs ? word.es : word.en;

  function doSubmit() {
    if (submitted) return;
    const val = input.value.trim();
    if (!val) return;
    submitted = true;

    const result = checkAnswer(val, correctAnswer);
    correct = result !== 'wrong';

    input.classList.add(correct ? 'correct' : 'wrong');
    input.classList.add(correct ? 'animate-correct' : 'animate-shake');
    submit.style.display = 'none';
    feedback.style.display = 'block';
    feedback.classList.add('reveal-up');

    // In EN→ES mode, show book sentence after answering as a memory anchor
    const postContextHtml = enEs && contextHtml
      ? `<div style="margin-top:10px">${contextHtml}</div>`
      : '';

    if (result === 'exact') {
      feedback.innerHTML = `<div class="feedback correct"><span class="feedback-verdict">✓ Correct</span><span class="feedback-answer">${correctAnswer}</span></div>${postContextHtml}`;
    } else if (result === 'fuzzy') {
      feedback.innerHTML = `<div class="feedback fuzzy"><span class="feedback-verdict">≈ Close enough</span><span class="feedback-answer">${correctAnswer}</span></div>${postContextHtml}`;
    } else {
      feedback.innerHTML = `<div class="feedback wrong"><span class="feedback-verdict">✗ Wrong</span><span class="feedback-answer">${correctAnswer}</span></div>${postContextHtml}`;
    }

    next.style.display = 'block';
    next.classList.add('reveal-up');
    next.focus();
    onResult({ correct, card });
  }

  submit.addEventListener('click', doSubmit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSubmit(); });
  next.addEventListener('click', () => onResult({ correct, card, advance: true }));
}
