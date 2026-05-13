document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Popup Logic
    const popup = document.getElementById('scroll-popup');
    const closeBtn = document.getElementById('popup-close');
    let popupShown = false;

    // Show popup after scrolling 400px
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400 && !popupShown) {
            popup.classList.add('show');
            popupShown = true;
        }
    });

    // Trigger popup on button click
    const popupTriggers = document.querySelectorAll('.trigger-popup');
    popupTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (popup) {
                popup.classList.add('show');
                popupShown = true;
            }
        });
    });

    // Close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
        });
    }

    // Close on click outside the popup content
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('show');
            }
        });
    }

    // ─── Form Submission Handler ──────────────────────────────────────────────
    async function submitLead(formEl, btnEl) {
        const name   = formEl.querySelector('[name="name"]').value.trim();
        const phone  = formEl.querySelector('[name="phone"]').value.trim();
        const status = formEl.querySelector('[name="status"]')?.value || '';
        const goal   = formEl.querySelector('[name="goal"]')?.value || '';

        // Show loading state
        const originalText = btnEl.textContent;
        btnEl.textContent = 'Submitting…';
        btnEl.disabled = true;

        try {
            const res = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, status, goal }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                btnEl.textContent = '✓ Submitted!';
                btnEl.style.backgroundColor = '#33A2B7';
                formEl.reset();
                // Close popup if it's open
                setTimeout(() => {
                    popup && popup.classList.remove('show');
                    btnEl.textContent = originalText;
                    btnEl.disabled = false;
                    btnEl.style.backgroundColor = '';
                }, 2500);
            } else {
                throw new Error(data.error || 'Submission failed.');
            }
        } catch (err) {
            btnEl.textContent = '✗ Error — Try again';
            btnEl.style.backgroundColor = '#c0392b';
            setTimeout(() => {
                btnEl.textContent = originalText;
                btnEl.disabled = false;
                btnEl.style.backgroundColor = '';
            }, 3000);
        }
    }

    // Attach to popup form
    const popupForm = document.querySelector('#scroll-popup .cta-form');
    if (popupForm) {
        popupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitLead(popupForm, popupForm.querySelector('[type="submit"]'));
        });
    }

    // Attach to main CTA form
    const mainForm = document.querySelector('#apply .cta-form');
    if (mainForm) {
        mainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitLead(mainForm, mainForm.querySelector('[type="submit"]'));
        });
    }
});
