export async function loadAccounts() {
    try {
        const response = await fetch('/api/check');
        const data = await response.json();
        const select = document.getElementById('accountSelect');
        
        select.innerHTML = data.accounts.length 
            ? data.accounts.map(acc => `<option value="${acc}">${acc}</option>`).join('')
            : '<option value="">No accounts found</option>';
    } catch (error) {
        console.error('Error loading accounts:', error);
    }
}
