// js/modes/flashcard.js
import { lookupSentence } from '../word-index.js';

function highlightWord(sentence, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return sentence.replace(new RegExp(`(${escaped})`, 'gi'), '<strong>$1</strong>');
}

export async function render(container, card, onResult, allWords, direction = 'es-en') {
  const { word } = card;
  const enEs = direction === 'en-es';
  let flipped = false;
  let answered = false;

  const bookSentence = await lookupSentence(word.es);
  const rawSentence = bookSentence || word.example || null;
  const contextHtml = rawSentence
    ? `<p class="book-sentence" style="margin-top:14px">«${highlightWord(rawSentence, word.es)}»</p>`
    : '';

  // Front: the prompt. Back: the answer + book sentence.
  const frontWord = enEs ? word.en : word.es;
  const backWord  = enEs ? word.es : word.en;
  const backSize  = enEs ? '2rem' : '1.8rem';

  container.innerHTML = `
    <div class="flashcard-wrap" id="fc-wrap" title="Click to flip">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <!-- <div class="tag">${word.pos}</div> -->
          <div class="flashcard-word">${frontWord}</div>
          <div class="flashcard-hint">Click to reveal</div>
        </div>
        <div class="flashcard-back">
          <div class="flashcard-word" style="font-size:${backSize}">${backWord}</div>
          ${contextHtml}
        </div>
      </div>
    </div>

    <div id="fc-actions" style="display:none">
      <p class="muted" style="text-align:center;margin-bottom:12px">Did you get it right?</p>
      <div style="display:flex;gap:12px">
        <button id="fc-wrong"   class="btn btn-error btn-full">I didn't know</button>
        <button id="fc-correct" class="btn btn-success btn-full">I knew it</button>
      </div>
    </div>
  `;

  const wrap       = container.querySelector('#fc-wrap');
  const actions    = container.querySelector('#fc-actions');
  const btnWrong   = container.querySelector('#fc-wrong');
  const btnCorrect = container.querySelector('#fc-correct');

  wrap.addEventListener('click', () => {
    if (answered) return;
    flipped = !flipped;
    wrap.classList.toggle('flipped', flipped);
    if (flipped && actions.style.display !== 'block') {
      actions.style.display = 'block';
      actions.classList.add('reveal-up');
    }
  });

  function handleKey(e) {
    if ((e.key === ' ' || e.key === 'Enter') && !flipped && !answered) {
      e.preventDefault();
      wrap.click();
    }
  }
  document.addEventListener('keydown', handleKey);

  const observer = new MutationObserver(() => {
    if (!document.contains(wrap)) {
      document.removeEventListener('keydown', handleKey);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  btnCorrect.addEventListener('click', () => {
    if (answered) return;
    answered = true;
    onResult({ correct: true, card, advance: true });
  });

  btnWrong.addEventListener('click', () => {
    if (answered) return;
    answered = true;
    onResult({ correct: false, card, advance: true });
  });
}
