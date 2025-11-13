// ========================================
// UTILITY: Debounce (for performance)
// ========================================
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

// ========================================
// PRELOADER (Smooth Fade Out)
// ========================================
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        // Force reflow to ensure transition works
        preloader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.style.overflow = ''; // Re-enable scroll
            }, 500);
        }, 300);
    }
});

// ========================================
// SIDEBAR MENU (Dynamic + Active State + Bilingual)
// ========================================
const menuItems = [
    { en: 'Home', mr: 'होम', icon: 'fas fa-home', link: 'index.html' },
    { en: 'Create Agreement', mr: 'करार तयार करा', icon: 'fas fa-file-contract', link: 'booking.html' },
    { en: 'Calculate Charges', mr: 'शुल्क मोजा', icon: 'fas fa-calculator', link: 'index.html#calculator' },
    { en: 'Track Status', mr: 'स्थिती तपासा', icon: 'fas fa-search', link: 'track.html' },
    { en: 'FAQ', mr: 'वारंवार विचारले प्रश्न', icon: 'fas fa-question-circle', link: 'index.html#faq' },
    { en: 'Contact', mr: 'संपर्क', icon: 'fas fa-phone', link: 'tel:8830402939' }
];

const sidebarMenu = document.getElementById('sidebarMenu');
if (sidebarMenu) {
    const currentLang = document.documentElement.getAttribute('data-lang') || 'en';
    const currentPath = location.pathname.split('/').pop() || 'index.html';
    const currentHash = location.hash;

    menuItems.forEach(item => {
        const li = document.createElement('li');
        const isActive = (
            item.link === currentPath ||
            (item.link.includes('#') && currentHash === item.link.split('#')[1]) ||
            (currentPath === 'index.html' && item.link === 'index.html')
        );

        li.innerHTML = `
            <a href="${item.link}" ${isActive ? 'class="active"' : ''}>
                <i class="${item.icon}"></i>
                <span data-en="${item.en}" data-mr="${item.mr}">${item[currentLang]}</span>
            </a>
        `;
        sidebarMenu.appendChild(li);
    });
}

// ========================================
// MOBILE MENU TOGGLE + SWIPE + ESC KEY
// ========================================
const hamburger = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.sidebar');

if (hamburger && sidebar) {
    const openSidebar = () => {
        sidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const closeSidebar = () => {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', e => {
        e.stopPropagation();
        sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
    });

    // Close on outside click
    document.addEventListener('click', e => {
        if (window.innerWidth <= 992 && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                closeSidebar();
            }
        }
    });

    // Close on ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });

    // Swipe to close
    let touchStartX = 0;
    document.addEventListener('touchstart', e => {
        if (sidebar.classList.contains('active')) {
            touchStartX = e.touches[0].clientX;
        }
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (!sidebar.classList.contains('active')) return;
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 80) {
            closeSidebar();
        }
    }, { passive: true });
}

// ========================================
// THEME TOGGLE (Dark/Light + Save + Smooth)
// ========================================
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeUI(newTheme);
    });

    function updateThemeUI(theme) {
        const icon = themeToggle.querySelector('i');
        const span = themeToggle.querySelector('span');
        if (!icon || !span) return;

        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        span.textContent = theme === 'dark'
            ? (lang === 'mr' ? 'लाइट मोड' : 'Light Mode')
            : (lang === 'mr' ? 'डार्क मोड' : 'Dark Mode');
    }
}

// ========================================
// LANGUAGE TOGGLE (EN ↔ MR + Save + Full Sync)
// ========================================
const langToggle = document.getElementById('langToggle');
if (langToggle) {
    const savedLang = localStorage.getItem('lang') || 'en';
    document.documentElement.setAttribute('data-lang', savedLang);
    updateLangUI(savedLang);
    translatePage(savedLang);

    langToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-lang');
        const newLang = current === 'en' ? 'mr' : 'en';
        document.documentElement.setAttribute('data-lang', newLang);
        localStorage.setItem('lang', newLang);
        updateLangUI(newLang);
        translatePage(newLang);
        // Rebuild sidebar menu with new language
        rebuildSidebarMenu(newLang);
    });

    function updateLangUI(lang) {
        const btn = langToggle.querySelector('.lang-text') || langToggle.querySelector('span');
        if (btn) btn.textContent = lang.toUpperCase();
    }

    function translatePage(lang) {
        document.querySelectorAll('[data-en], [data-mr]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text !== null) {
                if (el.children.length > 0 && !el.classList.contains('btn-text')) {
                    // Preserve child elements (icons, etc.)
                    const textNode = Array.from(el.childNodes).find(node => node.nodeType === 3);
                    if (textNode) textNode.textContent = text;
                } else {
                    el.textContent = text;
                }
            }
        });

        // Update <title> and meta
        const title = document.querySelector('title');
        if (title && title.hasAttribute(`data-${lang}`)) {
            title.textContent = title.getAttribute(`data-${lang}`);
        }
        const meta = document.querySelector('meta[name="description"]');
        if (meta && meta.hasAttribute(`data-${lang}`)) {
            meta.setAttribute('content', meta.getAttribute(`data-${lang}`));
        }
    }

    function rebuildSidebarMenu(lang) {
        if (!sidebarMenu) return;
        sidebarMenu.innerHTML = '';
        const currentPath = location.pathname.split('/').pop() || 'index.html';
        const currentHash = location.hash;

        menuItems.forEach(item => {
            const li = document.createElement('li');
            const isActive = (
                item.link === currentPath ||
                (item.link.includes('#') && currentHash === item.link.split('#')[1])
            );
            li.innerHTML = `
                <a href="${item.link}" ${isActive ? 'class="active"' : ''}>
                    <i class="${item.icon}"></i>
                    <span data-en="${item.en}" data-mr="${item.mr}">${item[lang]}</span>
                </a>
            `;
            sidebarMenu.appendChild(li);
        });
    }
}


// ========================================
// FLOATING LABELS (All Forms)
// ========================================
document.querySelectorAll('.form-group').forEach(group => {
    const input = group.querySelector('input, textarea, select');
    const label = group.querySelector('label');
    if (!input || !label) return;

    const update = () => {
        label.classList.toggle('floating', !!input.value || input === document.activeElement);
    };

    input.addEventListener('input', update);
    input.addEventListener('focus', update);
    input.addEventListener('blur', update);
    if (input.value) update();
});

// ========================================
// BOOKING PAGE: FILE UPLOAD + PREVIEW + REMOVE
// ========================================
if (document.getElementById('agreementForm')) {
    const fileInputs = ['landlordAadharFile', 'tenantAadharFile', 'propertyProof', 'photo'];

    fileInputs.forEach(id => {
        const input = document.getElementById(id);
        const preview = document.getElementById(id + 'Preview');
        if (!input || !preview) return;

        input.addEventListener('change', () => {
            const file = input.files[0];
            preview.innerHTML = '';

            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = e => {
                const isImage = file.type.startsWith('image/');
                preview.innerHTML = `
                    <div class="uploaded-file">
                        ${isImage ? `<img src="${e.target.result}" alt="Preview">` : `<i class="fas fa-file-pdf"></i>`}
                        <div class="file-info">
                            <span title="${file.name}">${file.name.slice(0, 20)}${file.name.length > 20 ? '...' : ''}</span>
                            <small>${(file.size / 1024).toFixed(1)} KB</small>
                        </div>
                        <button type="button" class="remove-file" aria-label="Remove">×</button>
                    </div>
                `;
                preview.querySelector('.remove-file').onclick = () => {
                    preview.innerHTML = '';
                    input.value = '';
                };
            };
            reader.readAsDataURL(file);
        });
    });

    // Form Submit with Loading + Tracking ID
document.getElementById('agreementForm').addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const formData = new FormData();
    const payload = {
        landlordName: document.getElementById('landlordName').value.trim(),
        landlordContact: document.getElementById('landlordContact').value,
        landlordAadhar: document.getElementById('landlordAadhar').value,
        landlordEmail: document.getElementById('landlordEmail').value,
        tenantName: document.getElementById('tenantName').value.trim(),
        tenantContact: document.getElementById('tenantContact').value,
        tenantAadhar: document.getElementById('tenantAadhar').value,
        tenantEmail: document.getElementById('tenantEmail').value,
        propertyAddress: document.getElementById('propertyAddress').value,
        propertyCity: document.getElementById('propertyCity').value,
        propertyPincode: document.getElementById('propertyPincode').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        rentAmount: Number(document.getElementById('rentAmount').value),
        depositAmount: Number(document.getElementById('depositAmount').value),
        agreementType: document.getElementById('agreementType').value
    };

    // Validation
    for (const [key, value] of Object.entries(payload)) {
        if (typeof value === 'string' && !value.trim() && key !== 'photo') {
            alert(`Please fill ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            return;
        }
    }

    Object.keys(payload).forEach(key => formData.append(key, payload[key]));
    fileInputs.forEach(id => {
        const file = document.getElementById(id)?.files[0];
        if (file) formData.append(id, file);
    });

    try {
        const res = await fetch('http://localhost:5000/api/agreements', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        const msg = document.getElementById('responseMessage');
        if (!msg) return;

        msg.style.display = 'block';
        msg.style.color = res.ok ? 'var(--success)' : 'var(--danger)';

        if (res.ok) {
            const trackingId = data.agreementId || 'N/A';
            msg.innerHTML = `
                <div style="padding: 12px; background: rgba(0, 102, 204, 0.05); border-radius: 8px;">
                    <strong>${data.message || 'Agreement created successfully!'}</strong><br><br>
                    <strong style="font-size: 1.2rem; color: var(--primary);">Tracking ID: ${trackingId}</strong><br><br>
                    <a href="track.html" style="color: var(--accent); text-decoration: underline;">Track your status here</a>
                </div>
            `;
            msg.scrollIntoView({ behavior: 'smooth' });

            // ✅ Keep tracking ID visible for 10s before clearing form
            setTimeout(() => {
                e.target.reset();
                document.querySelectorAll('.file-preview').forEach(p => p.innerHTML = '');
                msg.innerHTML = '';
            }, 10000); // 10 sec delay
        } else {
            msg.innerHTML = data.message || 'Failed. Please try again.';
        }
    } catch (err) {
        console.error(err);
        const msg = document.getElementById('responseMessage');
        if (msg) {
            msg.innerHTML = 'Network error. Please check your connection.';
            msg.style.color = 'var(--danger)';
            msg.style.display = 'block';
            msg.scrollIntoView({ behavior: 'smooth' });
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});
}


// AUTO-RESIZE TEXTAREA (if any)
document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    });
});

// RENT AGREEMENT CHARGE CALCULATOR + CALL POPUP
document.addEventListener("DOMContentLoaded", () => {
    // ============= CALCULATOR =============
    const form = document.getElementById("calcForm");
    const resultBox = document.getElementById("resultBox");

    if (form && resultBox) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const rent = parseFloat(document.getElementById("rentAmount").value) || 0;
            const deposit = parseFloat(document.getElementById("depositAmount").value) || 0;
            const months = parseInt(document.getElementById("duration").value) || 0;
            const type = document.getElementById("agreementType").value;

            if (rent <= 0 || months <= 0 || !type) {
                alert("Please fill all fields correctly");
                return;
            }

            const baseAmount = rent * months + deposit;
            let stampDuty = 0;

            if (type === "Residential") {
                stampDuty = Math.max(100, Math.round(baseAmount * 0.0025));
            } else if (type === "Commercial") {
                stampDuty = Math.max(100, Math.round(baseAmount * 0.005));
            }

            const regFee = 1000;
            const dhc = 300;
            const serviceCharge = 799;
            const total = stampDuty + regFee + dhc + serviceCharge;

            document.getElementById("stampDuty").textContent = stampDuty.toLocaleString();
            document.getElementById("regFee").textContent = regFee.toLocaleString();
            document.getElementById("dhc").textContent = dhc.toLocaleString();
            document.getElementById("serviceCharge").textContent = serviceCharge.toLocaleString();
            document.getElementById("total").textContent = total.toLocaleString();

            resultBox.style.display = "block";
            resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }

    // ============= CALL NOW POPUP =============
    const popup = document.getElementById("callPopup");
    const closeBtn = document.getElementById("closePopup");

    if (popup && closeBtn) {
        let hasShown = sessionStorage.getItem("callPopupShown") === "true"; // String compare

        // Close button
        closeBtn.addEventListener("click", () => {
            popup.classList.remove("show");
            sessionStorage.setItem("callPopupShown", "true");
            hasShown = true;
        });

        // Auto show after 30 sec
        if (!hasShown) {
            setTimeout(() => {
                popup.style.display = "flex";
                setTimeout(() => popup.classList.add("show"), 50);
            }, 30000);
        }

        // Show again after 5 min inactivity
        let lastActivity = Date.now();
        const updateActivity = () => lastActivity = Date.now();

        document.addEventListener("mousemove", updateActivity);
        document.addEventListener("scroll", updateActivity);
        document.addEventListener("keydown", updateActivity);

        setInterval(() => {
            if (!sessionStorage.getItem("callPopupShown") && (Date.now() - lastActivity > 300000)) {
                popup.style.display = "flex";
                setTimeout(() => popup.classList.add("show"), 50);
                sessionStorage.setItem("callPopupShown", "true");
            }
        }, 60000);
    }

});
