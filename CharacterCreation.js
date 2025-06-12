document.addEventListener('DOMContentLoaded', () => {
    const introContainer = document.getElementById('introContainer');
    const nameInput = document.getElementById('nameUserInput');
    const submitBtn = document.getElementById('userNameSubmit');

    const app = document.getElementById('app');
    const characterNameHeader = document.getElementById('characterNameHeader');

    const entryText = document.getElementById('entryText');
    const entryTags = document.getElementById('entryTags');
    const moodSelect = document.getElementById('moodSelect');
    const saveEntryBtn = document.getElementById('saveEntryBtn');

    const searchInput = document.getElementById('searchInput');
    const entriesList = document.getElementById('entriesList');

    let characterName = localStorage.getItem('characterName') || '';
    let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];

    // Track if editing an entry
    let editingEntryId = null;

    // Initialize
    if (characterName) {
        showApp();
        renderEntries();
    }

    submitBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name.length === 0) {
            alert('Please enter a name for your character!');
            return;
        }
        characterName = name;
        localStorage.setItem('characterName', characterName);
        showApp();
    });

    saveEntryBtn.addEventListener('click', () => {
        const text = entryText.value.trim();
        if (!text) {
            alert('Diary entry cannot be empty!');
            return;
        }

        const tags = entryTags.value
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);

        const mood = moodSelect.value;
        const date = new Date().toISOString();

        if (editingEntryId !== null) {
            // Edit mode: update existing entry
            const idx = entries.findIndex(e => e.id === editingEntryId);
            if (idx !== -1) {
                entries[idx].text = text;
                entries[idx].tags = tags;
                entries[idx].mood = mood;
                entries[idx].date = date; // update timestamp on edit
            }
            editingEntryId = null;
            saveEntryBtn.textContent = 'Save Entry';
        } else {
            // New entry
            const entry = {
                id: Date.now(),
                text,
                tags,
                mood,
                date
            };
            entries.push(entry);
        }

        localStorage.setItem('diaryEntries', JSON.stringify(entries));

        entryText.value = '';
        entryTags.value = '';
        moodSelect.value = 'neutral';

        renderEntries();
    });

    searchInput.addEventListener('input', () => {
        renderEntries(searchInput.value.trim().toLowerCase());
    });

    function showApp() {
        introContainer.style.display = 'none';
        app.style.display = 'block';
        characterNameHeader.textContent = `Character: ${characterName}`;
    }

    function renderEntries(filter = '') {
        entriesList.innerHTML = '';

        const filteredEntries = entries.filter(entry => {
            if (!filter) return true;
            const inText = entry.text.toLowerCase().includes(filter);
            const inTags = entry.tags.some(tag => tag.includes(filter));
            return inText || inTags;
        });

        if (filteredEntries.length === 0) {
            entriesList.innerHTML = '<p>No diary entries found.</p>';
            return;
        }

        filteredEntries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(entry => {
                const entryEl = document.createElement('div');
                entryEl.classList.add('entry');

                const dateStr = new Date(entry.date).toLocaleString();

                entryEl.innerHTML = `
          <div><strong>Date:</strong> ${dateStr}</div>
          <div><strong>Mood:</strong> ${moodEmoji(entry.mood)} ${entry.mood}</div>
          <div><strong>Tags:</strong> ${entry.tags.join(', ') || 'None'}</div>
          <p>${entry.text.replace(/\n/g, '<br>')}</p>
          <div class="entry-buttons">
            <button class="edit-btn" data-id="${entry.id}">Edit ✏️</button>
            <button class="delete-btn" data-id="${entry.id}">Delete 🗑️</button>
          </div>
          <hr>
        `;

                entriesList.appendChild(entryEl);
            });

        // Attach event listeners for Edit and Delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.dataset.id);
                startEditEntry(id);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.dataset.id);
                deleteEntry(id);
            });
        });
    }

    function startEditEntry(id) {
        const entry = entries.find(e => e.id === id);
        if (!entry) return;

        entryText.value = entry.text;
        entryTags.value = entry.tags.join(', ');
        moodSelect.value = entry.mood;
        editingEntryId = id;
        saveEntryBtn.textContent = 'Update Entry';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteEntry(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            entries = entries.filter(e => e.id !== id);
            localStorage.setItem('diaryEntries', JSON.stringify(entries));
            if (editingEntryId === id) {
                // Cancel editing if deleting the edited entry
                editingEntryId = null;
                entryText.value = '';
                entryTags.value = '';
                moodSelect.value = 'neutral';
                saveEntryBtn.textContent = 'Save Entry';
            }
            renderEntries(searchInput.value.trim().toLowerCase());
        }
    }

    function moodEmoji(mood) {
        switch (mood) {
            case 'happy': return '😊';
            case 'sad': return '😢';
            case 'anxious': return '😰';
            case 'angry': return '😡';
            default: return '😐';
        }
    }
});

const cookieConsent = document.getElementById('cookieConsent');
const acceptCookiesBtn = document.getElementById('acceptCookiesBtn');
const denyCookiesBtn = document.getElementById('denyCookiesBtn');

let cookiesAllowed = false; // track consent

function hasCookieConsent() {
    return localStorage.getItem('cookieConsentGiven') === 'true';
}

function hasCookieDenied() {
    return localStorage.getItem('cookieConsentDenied') === 'true';
}

function showCookieBanner() {
    if (!hasCookieConsent() && !hasCookieDenied()) {
        cookieConsent.style.display = 'flex';
    } else {
        cookieConsent.style.display = 'none';
    }
}

acceptCookiesBtn.addEventListener('click', () => {
    localStorage.setItem('cookieConsentGiven', 'true');
    localStorage.removeItem('cookieConsentDenied');
    cookiesAllowed = true;
    cookieConsent.style.display = 'none';
    initApp(true); // init app with storage enabled
});

denyCookiesBtn.addEventListener('click', () => {
    localStorage.setItem('cookieConsentDenied', 'true');
    localStorage.removeItem('cookieConsentGiven');
    cookiesAllowed = false;
    cookieConsent.style.display = 'none';
    initApp(false); // init app with NO storage
});

// The main app logic will be inside this function:
function initApp(storageAllowed) {
    // Override localStorage methods if not allowed:
    if (!storageAllowed) {
        // Use a dummy storage to block saving
        window.localStorage.setItem = function () {};
        window.localStorage.getItem = function () { return null; };
        window.localStorage.removeItem = function () {};
    }

    // Now you can run your main app logic here or call your existing code to load/save normally

    // For example:
    // load characterName, entries from localStorage if storageAllowed
    // enable or disable saving entries accordingly

    // To keep your existing code, you can move the app init code here,
    // or better yet, wrap your existing app code in a function that receives storageAllowed.
}

// On page load:
if (hasCookieConsent()) {
    cookiesAllowed = true;
    initApp(true);
} else if (hasCookieDenied()) {
    cookiesAllowed = false;
    initApp(false);
} else {
    showCookieBanner();
}
