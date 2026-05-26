// Cookie Banner
(() => {
    const style = document.createElement('style');
    style.textContent = `
        /* Cookie banner styles */
        #cookie-banner {
            position: fixed;
            bottom: 30px;
            left: 30px;
            z-index: 100;
            background: #fff;
            border: 1px solid rgba(120, 100, 80, 0.2);
            padding: 12px;
            border-radius: 6px;
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
            max-width: 320px;
            transition: opacity 0.25s ease, transform 0.25s ease;
        }

        #cookie-banner.hidden {
            opacity: 0;
            pointer-events: none;
            transform: translateY(12px);
        }

        .cookie-text {
            font-family: 'Cormorant Garamond', serif;
            font-size: 13px;
            color: rgba(60, 50, 45, 0.75);
            margin-bottom: 10px;
        }

        .cookie-row {
            display: flex;
            gap: 8px;
        }

        .cookie-btn {
            flex: 1;
            padding: 8px 10px;
            font-family: 'Cormorant Garamond', serif;
            font-size: 12px;
            text-transform: uppercase;
            border: 1px solid rgba(120, 100, 80, 0.18);
            background: transparent;
            color: rgba(60, 50, 45, 0.65);
            cursor: pointer;
        }

        .cookie-btn:hover {
            border-color: rgba(120, 100, 80, 0.36);
            color: #6b5a48;
            background: rgba(120, 100, 80, 0.04);
        }

        #cookie-options {
            display: none;
            margin-top: 10px;
            padding: 10px;
            border: 1px solid rgba(120, 100, 80, 0.08);
            background: #fff;
        }

        #cookie-options.active {
            display: block;
        }

        .opt-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
        }

        .opt-row label {
            font-family: 'Cormorant Garamond', serif;
            color: rgba(60, 50, 45, 0.7);
        }

        .save-btn {
            margin-top: 8px;
            padding: 8px 10px;
            width: 100%;
            border: 1px solid rgba(120, 100, 80, 0.2);
            background: rgba(139, 115, 85, 0.06);
            color: #6b5a48;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-text">We use cookies to improve the experience. Choose an option.</div>
        <div class="cookie-row">
            <button class="cookie-btn" id="cookie-disagree">Disagree</button>
            <button class="cookie-btn" id="cookie-manage">Manage</button>
            <button class="cookie-btn" id="cookie-agree">Agree</button>
        </div>
        <div id="cookie-options">
            <div class="opt-row"><label>Necessary</label><input type="checkbox" id="opt-necessary" checked disabled></div>
            <div class="opt-row"><label>Analytics</label><input type="checkbox" id="opt-analytics"></div>
            <div class="opt-row"><label>Preferences</label><input type="checkbox" id="opt-preferences"></div>
            <div class="opt-row"><label>Marketing</label><input type="checkbox" id="opt-marketing"></div>
            <button class="save-btn" id="cookie-save">Save preferences</button>
        </div>
    `;
    document.body.appendChild(banner);

    function initCookieBanner() {
        const cookieBanner = document.getElementById('cookie-banner');
        const agree = document.getElementById('cookie-agree');
        const disagree = document.getElementById('cookie-disagree');
        const manage = document.getElementById('cookie-manage');
        const opts = document.getElementById('cookie-options');
        const save = document.getElementById('cookie-save');

        const inputs = {
            analytics: document.getElementById('opt-analytics'),
            preferences: document.getElementById('opt-preferences'),
            marketing: document.getElementById('opt-marketing')
        };

        const hasConsent = () => localStorage.getItem('cookieConsent') !== null;

        function hide() { cookieBanner.classList.add('hidden'); }

        function savePrefs(prefs) {
            localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
            localStorage.setItem('cookieConsent', prefs.consent || 'custom');
            window.dispatchEvent(new Event('cookieConsentChanged'));
        }

        function applyPrefsToInputs() {
            const raw = localStorage.getItem('cookiePreferences');
            if (!raw) return;
            try {
                const p = JSON.parse(raw);
                inputs.analytics.checked = !!p.analytics;
                inputs.preferences.checked = !!p.preferences;
                inputs.marketing.checked = !!p.marketing;
            } catch (e) {}
        }

        // initial state
        if (!hasConsent()) cookieBanner.classList.remove('hidden');
        else applyPrefsToInputs();

        agree.addEventListener('click', () => {
            const prefs = {consent: 'agreed', analytics: true, preferences: true, marketing: true};
            savePrefs(prefs);
            hide();
        });

        disagree.addEventListener('click', () => {
            const prefs = {consent: 'disagreed', analytics: false, preferences: false, marketing: false};
            savePrefs(prefs);
            hide();
        });

        manage.addEventListener('click', () => {
            opts.classList.toggle('active');
            applyPrefsToInputs();
        });

        save.addEventListener('click', () => {
            const prefs = {consent: 'custom', analytics: !!inputs.analytics.checked, preferences: !!inputs.preferences.checked, marketing: !!inputs.marketing.checked};
            savePrefs(prefs);
            hide();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieBanner);
    } else {
        initCookieBanner();
    }
})();
