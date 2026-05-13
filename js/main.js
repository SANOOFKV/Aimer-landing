document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // ─── LeadSquared Config ───────────────────────────────────────────────────
    const LSQ_URL = 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Create?accessKey=u$r0f83abac5915f1175344c491a1481e4a&secretKey=e23030c4b0cc1edc251ad61ce5340a9f6499c21d';


    // ─── Popup Logic ──────────────────────────────────────────────────────────
    const popup    = document.getElementById('scroll-popup');
    const closeBtn = document.getElementById('popup-close');
    let popupShown = false;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400 && !popupShown) {
            popup.classList.add('show');
            popupShown = true;
        }
    });

    document.querySelectorAll('.trigger-popup').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            popup.classList.add('show');
            popupShown = true;
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => popup.classList.remove('show'));
    if (popup) popup.addEventListener('click', (e) => { if (e.target === popup) popup.classList.remove('show'); });

    // ─── Lead Submit ──────────────────────────────────────────────────────────
    async function submitLead(formEl, btnEl) {
        const name   = formEl.querySelector('[name="name"]').value.trim();
        const phone  = formEl.querySelector('[name="phone"]').value.trim();
        const status = formEl.querySelector('[name="status"]')?.value || '';
        const goal   = formEl.querySelector('[name="goal"]')?.value || '';

        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName  = nameParts.slice(1).join(' ') || '';

        const email  = formEl.querySelector('[name="email"]')?.value.trim() || '';

        const payload = [
            { Attribute: 'FirstName',     Value: firstName },
            { Attribute: 'LastName',      Value: lastName  },
            { Attribute: 'Phone',         Value: phone     },
            { Attribute: 'EmailAddress',  Value: email     },
            { Attribute: 'Source',        Value: 'UGBIP Landing Page' },
        ];

        console.log('Submitting lead:', { firstName, lastName, phone, email });

        // Loading state
        const originalText = btnEl.textContent;
        btnEl.textContent = 'Submitting…';
        btnEl.disabled = true;

        try {
            const res = await fetch(LSQ_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                btnEl.textContent = '✓ Submitted!';
                btnEl.style.backgroundColor = '#33A2B7';
                formEl.reset();
                setTimeout(() => {
                    popup && popup.classList.remove('show');
                    btnEl.textContent = originalText;
                    btnEl.disabled = false;
                    btnEl.style.backgroundColor = '';
                }, 2500);
            } else {
                const err = await res.text();
                console.error('LeadSquared error:', err);
                throw new Error('CRM error');
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
