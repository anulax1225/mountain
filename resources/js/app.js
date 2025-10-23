import Alpine from 'alpinejs';
import { setupVimeshUI } from '@vimesh/ui/dist/vui.mjs';
import tash from 'alpinejs-tash';
import focus from '@alpinejs/focus';
import conpositor from './conpositor';

Alpine.plugin([conpositor, tash]);

window.Alpine = Alpine;

Alpine.start();