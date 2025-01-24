import { loadAccounts } from './components/load.js';
import { initSearch } from './components/search.js';
import { initDownload } from './components/download.js';

document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
    initSearch();
    initDownload();
});
