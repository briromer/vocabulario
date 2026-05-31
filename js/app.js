// js/app.js
import { Router } from './router.js';

const root = document.getElementById('app');
const router = new Router(root);
router.go('home');
