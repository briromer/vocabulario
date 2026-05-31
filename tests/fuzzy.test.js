// tests/fuzzy.test.js
import { checkAnswer } from '../js/fuzzy.js';

export async function runFuzzyTests({ suite, report, assert }) {
  suite('Fuzzy Answer Check');

  const cases = [
    ['dawn',      'dawn',        'exact'],
    ['DAWN',      'dawn',        'exact'],
    ['  dawn  ',  'dawn',        'exact'],
    ['to amaze',  'to amaze',    'exact'],
    ['daen',      'dawn',        'fuzzy'],
    ['fervour',   'fervor',      'fuzzy'],
    ['confort',   'comfort',     'fuzzy'],
    ['sunrise',   'dawn',        'wrong'],
    ['aa',        'dawn',        'wrong'],
    ['night',     'dawn',        'wrong'],
  ];

  for (const [input, correct, expected] of cases) {
    try {
      const result = checkAnswer(input, correct);
      assert(result === expected, `checkAnswer('${input}', '${correct}') = '${result}', want '${expected}'`);
      report(`checkAnswer('${input}', '${correct}') → '${expected}'`, true);
    } catch (e) {
      report(`checkAnswer('${input}', '${correct}') → '${expected}'`, false, e.message);
    }
  }
}
