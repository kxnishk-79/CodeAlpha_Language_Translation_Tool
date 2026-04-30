// ===== OmniVox — Language Translation App =====
// Uses MyMemory Translation API (free, no API key required)

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'da', name: 'Danish', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'el', name: 'Greek', flag: '🇬🇷' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
    { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
    { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
    { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
    { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
    { code: 'et', name: 'Estonian', flag: '🇪🇪' },
    { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
    { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
    { code: 'ca', name: 'Catalan', flag: '🏳️' },
    { code: 'ga', name: 'Irish', flag: '🇮🇪' },
    { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
    { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
    { code: 'mk', name: 'Macedonian', flag: '🇲🇰' },
    { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
];

// ===== DOM Elements =====
const $ = (sel) => document.querySelector(sel);
const sourceLang = $('#sourceLang');
const targetLang = $('#targetLang');
const sourceText = $('#sourceText');
const outputText = $('#outputText');
const translateBtn = $('#translateBtn');
const swapBtn = $('#swapBtn');
const clearBtn = $('#clearBtn');
const copyBtn = $('#copyBtn');
const ttsSource = $('#ttsSource');
const ttsTarget = $('#ttsTarget');
const charCount = $('#charCount');
const detectedLang = $('#detectedLang');
const loadingOverlay = $('#loadingOverlay');
const confidenceBadge = $('#confidenceBadge');
const confidenceText = $('#confidenceText');
const themeToggle = $('#themeToggle');
const toast = $('#toast');
const copyTooltip = $('#copyTooltip');
const pronunciationArea = $('#pronunciationArea');
const pronunciationText = $('#pronunciationText');

// ===== Initialize Language Selectors =====
function populateLanguages() {
    LANGUAGES.forEach(lang => {
        const opt1 = new Option(`${lang.flag} ${lang.name}`, lang.code);
        const opt2 = new Option(`${lang.flag} ${lang.name}`, lang.code);
        sourceLang.appendChild(opt1);
        targetLang.appendChild(opt2);
    });
    targetLang.value = 'es'; // Default target
}

// ===== Theme =====
function initTheme() {
    const saved = localStorage.getItem('omnivox-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('omnivox-theme', next);
});

// ===== Character Count =====
sourceText.addEventListener('input', () => {
    charCount.textContent = sourceText.value.length;
});

// ===== Clear Button =====
clearBtn.addEventListener('click', () => {
    sourceText.value = '';
    outputText.innerHTML = '<span class="placeholder-text">Translation will appear here...</span>';
    charCount.textContent = '0';
    detectedLang.textContent = '';
    confidenceBadge.style.display = 'none';
    pronunciationArea.style.display = 'none';
    pronunciationText.textContent = '';
    sourceText.focus();
});

// ===== Translation API =====
let translateTimeout = null;

async function translateText() {
    const text = sourceText.value.trim();
    if (!text) {
        showToast('Please enter some text to translate.');
        return;
    }

    const src = sourceLang.value === 'auto' ? 'autodetect' : sourceLang.value;
    const tgt = targetLang.value;

    if (src === tgt && src !== 'autodetect') {
        outputText.textContent = text;
        return;
    }

    loadingOverlay.classList.add('active');
    translateBtn.disabled = true;

    try {
        const langPair = src === 'autodetect' ? `autodetect|${tgt}` : `${src}|${tgt}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        if (data.responseStatus === 200 || data.responseStatus === 403) {
            const translated = data.responseData.translatedText;
            outputText.textContent = translated;
            outputText.classList.remove('placeholder-text');

            // Show confidence
            const match = data.responseData.match;
            if (match !== undefined) {
                const pct = Math.round(match * 100);
                confidenceBadge.style.display = 'inline-flex';
                confidenceText.textContent = `${pct}% match`;
                const dot = confidenceBadge.querySelector('.confidence-dot');
                if (pct >= 80) {
                    confidenceBadge.style.background = 'rgba(34,197,94,0.1)';
                    confidenceBadge.style.color = '#22c55e';
                    dot.style.background = '#22c55e';
                } else if (pct >= 50) {
                    confidenceBadge.style.background = 'rgba(234,179,8,0.1)';
                    confidenceBadge.style.color = '#eab308';
                    dot.style.background = '#eab308';
                } else {
                    confidenceBadge.style.background = 'rgba(239,68,68,0.1)';
                    confidenceBadge.style.color = '#ef4444';
                    dot.style.background = '#ef4444';
                }
            }

            // Show detected language
            if (sourceLang.value === 'auto' && data.responseData.detectedLanguage) {
                const detCode = data.responseData.detectedLanguage;
                const detLang = LANGUAGES.find(l => l.code === detCode);
                if (detLang) {
                    detectedLang.textContent = `Detected: ${detLang.flag} ${detLang.name}`;
                }
            }

            // Show pronunciation
            showPronunciation(translated, tgt);
        } else {
            throw new Error(data.responseData?.translatedText || 'Translation failed');
        }
    } catch (err) {
        console.error('Translation error:', err);
        outputText.innerHTML = `<span style="color:#ef4444;">⚠️ ${err.message || 'Translation failed. Please try again.'}</span>`;
        showToast('Translation failed. Please try again.');
    } finally {
        loadingOverlay.classList.remove('active');
        translateBtn.disabled = false;
    }
}

translateBtn.addEventListener('click', translateText);

// Ctrl+Enter shortcut
sourceText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        translateText();
    }
});

// ===== Real-time Translation (debounced) =====
sourceText.addEventListener('input', () => {
    clearTimeout(translateTimeout);
    if (sourceText.value.trim().length > 2) {
        translateTimeout = setTimeout(translateText, 1200);
    }
});

// ===== Swap Languages =====
swapBtn.addEventListener('click', () => {
    if (sourceLang.value === 'auto') {
        showToast('Cannot swap when using Auto Detect.');
        return;
    }
    const tempLang = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tempLang;

    const tempText = sourceText.value;
    const outContent = outputText.textContent;
    if (outContent && !outputText.querySelector('.placeholder-text')) {
        sourceText.value = outContent;
        outputText.textContent = tempText;
        charCount.textContent = outContent.length;
    }
    detectedLang.textContent = '';
    pronunciationArea.style.display = 'none';
});

// ===== Copy to Clipboard =====
copyBtn.addEventListener('click', async () => {
    const text = outputText.textContent;
    if (!text || outputText.querySelector('.placeholder-text')) {
        showToast('Nothing to copy.');
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        copyTooltip.classList.add('show');
        setTimeout(() => copyTooltip.classList.remove('show'), 1500);
        showToast('Copied to clipboard!');
    } catch {
        showToast('Failed to copy.');
    }
});

// ===== Text-to-Speech =====
function speak(text, lang) {
    if (!text || !('speechSynthesis' in window)) {
        showToast('Text-to-speech not supported.');
        return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
}

ttsSource.addEventListener('click', () => {
    const lang = sourceLang.value === 'auto' ? 'en' : sourceLang.value;
    speak(sourceText.value, lang);
});

ttsTarget.addEventListener('click', () => {
    const text = outputText.textContent;
    if (!text || outputText.querySelector('.placeholder-text')) return;
    speak(text, targetLang.value);
});

// ===== Toast Notifications =====
let toastTimer = null;
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== Init =====
populateLanguages();
initTheme();

// ===== Pronunciation / Transliteration Engine =====
const CYRILLIC_MAP = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'ye','ё':'yo','ж':'zh','з':'z','и':'i',
    'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
    'у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y',
    'ь':'','э':'e','ю':'yu','я':'ya',
    'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'Ye','Ё':'Yo','Ж':'Zh','З':'Z','И':'I',
    'Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T',
    'У':'U','Ф':'F','Х':'Kh','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Shch','Ъ':'','Ы':'Y',
    'Ь':'','Э':'E','Ю':'Yu','Я':'Ya'
};

const GREEK_MAP = {
    'α':'a','β':'v','γ':'g','δ':'d','ε':'e','ζ':'z','η':'i','θ':'th','ι':'i','κ':'k',
    'λ':'l','μ':'m','ν':'n','ξ':'x','ο':'o','π':'p','ρ':'r','σ':'s','ς':'s','τ':'t',
    'υ':'y','φ':'f','χ':'ch','ψ':'ps','ω':'o',
    'Α':'A','Β':'V','Γ':'G','Δ':'D','Ε':'E','Ζ':'Z','Η':'I','Θ':'Th','Ι':'I','Κ':'K',
    'Λ':'L','Μ':'M','Ν':'N','Ξ':'X','Ο':'O','Π':'P','Ρ':'R','Σ':'S','Τ':'T',
    'Υ':'Y','Φ':'F','Χ':'Ch','Ψ':'Ps','Ω':'O',
    'ά':'a','έ':'e','ή':'i','ί':'i','ό':'o','ύ':'y','ώ':'o','ϊ':'i','ϋ':'y'
};

// Languages that use non-Latin scripts and need transliteration
const NON_LATIN_LANGS = ['ru','uk','bg','mk','sr','ja','ko','zh','ar','he','fa','hi','bn','ta','te','ur','th','el','ka'];

function hasNonLatinChars(text) {
    return /[^\u0000-\u007F\u00C0-\u024F\u1E00-\u1EFF]/.test(text);
}

function transliterateCyrillic(text) {
    return text.split('').map(c => CYRILLIC_MAP[c] !== undefined ? CYRILLIC_MAP[c] : c).join('');
}

function transliterateGreek(text) {
    return text.split('').map(c => GREEK_MAP[c] !== undefined ? GREEK_MAP[c] : c).join('');
}

function generatePronunciation(text, langCode) {
    // For Latin-script languages, pronunciation is self-evident
    if (!hasNonLatinChars(text)) return null;

    // Cyrillic languages (Russian, Ukrainian, Bulgarian, etc.)
    if (['ru','uk','bg','mk','sr'].includes(langCode)) {
        return transliterateCyrillic(text);
    }

    // Greek
    if (langCode === 'el') {
        return transliterateGreek(text);
    }

    // For CJK, Arabic, Devanagari, Thai — use reverse translation to get romanization
    // We translate the text to English using MyMemory which often gives a rough phonetic hint
    // But for immediate display, we'll fetch a romanized version
    return null; // Will be handled by async romanization
}

async function fetchRomanization(text, langCode) {
    try {
        // Use MyMemory to translate to English — this gives us a sense of the pronunciation
        // For a real app, a dedicated transliteration API would be used
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langCode}|en`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.responseStatus === 200 && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }
    } catch (e) {
        console.warn('Romanization fetch failed:', e);
    }
    return null;
}

async function showPronunciation(translatedText, langCode) {
    if (!translatedText) {
        pronunciationArea.style.display = 'none';
        return;
    }

    // Try direct transliteration first
    const directResult = generatePronunciation(translatedText, langCode);

    if (directResult) {
        pronunciationText.textContent = directResult;
        pronunciationArea.style.display = 'block';
        return;
    }

    // For non-Latin scripts without a direct map, fetch English meaning as pronunciation guide
    if (hasNonLatinChars(translatedText) && NON_LATIN_LANGS.includes(langCode)) {
        const romanized = await fetchRomanization(translatedText, langCode);
        if (romanized && romanized.toLowerCase() !== translatedText.toLowerCase()) {
            pronunciationText.textContent = romanized;
            pronunciationArea.style.display = 'block';
            return;
        }
    }

    // For Latin-script languages, show a simplified phonetic hint
    // by displaying the text as-is (it's already readable)
    pronunciationArea.style.display = 'none';
}
