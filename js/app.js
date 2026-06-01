// js/app.js
import { Router } from './router.js';

console.log(
  '%c“Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.”',
  'font-family: "EB Garamond", Georgia, serif; font-style: italic; font-size: 13px; color: oklch(73% 0.155 85); line-height: 1.7'
);
console.log('%c— Gabriel García Márquez, Cien años de soledad', 'font-size: 10px; color: #888; font-style: normal');
console.log('%c  Vocabulario  ', 'background: oklch(16% 0.026 45); color: oklch(73% 0.155 85); padding: 4px 12px; border-radius: 4px; font-size: 11px;');

const root = document.getElementById('app');
const router = new Router(root);
router.go('home');
