document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // ─── LeadSquared Config ───────────────────────────────────────────────────
    const LSQ_URL = 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Create?accessKey=u$r0f83abac5915f1175344c491a1481e4a&secretKey=e23030c4b0cc1edc251ad61ce5340a9f6499c21d';


    // ─── Popup Logic ──────────────────────────────────────────────────────────
    const popup    = document.getElementById('scroll-popup');
    const closeBtn = document.getElementById('popup-close');
    let popupShown = false;
    let currentIntent = 'apply'; // Track what triggered the popup

    // ─── UTM Tracking ─────────────────────────────────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource   = urlParams.get('utm_source')   || '';
    const utmMedium   = urlParams.get('utm_medium')   || '';
    const utmCampaign = urlParams.get('utm_campaign') || '';

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400 && !popupShown) {
            currentIntent = 'apply'; // Default to apply on scroll
            if(popupTitle) popupTitle.textContent = 'Apply for UGBIP';
            if(popupBtn) popupBtn.textContent = 'Apply Now';
            popup.classList.add('show');
            popupShown = true;
        }
    });

    const popupTitle = document.getElementById('popup-title');
    const popupBtn   = document.getElementById('popup-submit-btn');

    document.querySelectorAll('.trigger-popup').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Dynamic popup content based on button clicked
            const intent = trigger.getAttribute('data-intent');
            currentIntent = intent || 'apply';

            if (currentIntent === 'brochure') {
                if(popupTitle) popupTitle.textContent = 'Download Brochure';
                if(popupBtn) popupBtn.textContent = 'Download Brochure';
            } else {
                if(popupTitle) popupTitle.textContent = 'Apply for UGBIP';
                if(popupBtn) popupBtn.textContent = 'Apply Now';
            }

            popup.classList.add('show');
            popupShown = true;
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => popup.classList.remove('show'));
    if (popup) popup.addEventListener('click', (e) => { if (e.target === popup) popup.classList.remove('show'); });

    // ─── Lead Submit ──────────────────────────────────────────────────────────
    async function submitLead(formEl, btnEl, shouldDownload = false) {
        const name   = formEl.querySelector('[name="name"]').value.trim();
        const phone  = formEl.querySelector('[name="phone"]').value.trim();
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName  = nameParts.slice(1).join(' ') || '';

        const emailEl = formEl.querySelector('[name="email"]');
        const email = emailEl ? emailEl.value.trim() : '';
        
        const statusEl = formEl.querySelector('[name="status"]');
        const status = statusEl ? statusEl.value : '';
        
        const goalEl = formEl.querySelector('[name="goal"]');
        let goal = goalEl ? goalEl.value : '';

        // Expand short values back to full sentences for the Notes field
        const goalMapping = {
            'placed': 'Get placed in a top company',
            'startup': 'Start my own business / startup',
            'network': 'Build a strong professional network',
            'career_path': 'Figure out the right career path for me',
            'all': 'All of the above'
        };
        if (goalMapping[goal]) {
            goal = goalMapping[goal];
        }

        const payload = [
            { Attribute: 'FirstName',        Value: firstName },
            { Attribute: 'LastName',         Value: lastName  },
            { Attribute: 'Phone',            Value: phone     },
            { Attribute: 'EmailAddress',     Value: email     },
            { Attribute: 'mx_Qualification', Value: status    },
            { Attribute: 'Notes',            Value: goal      },
            { Attribute: 'Source',           Value: 'UGBIP Landing Page' },
        ];

        // Attach UTM parameters if they exist
        if (utmSource)   payload.push({ Attribute: 'SourceContent',  Value: utmSource });
        if (utmMedium)   payload.push({ Attribute: 'SourceMedium',   Value: utmMedium });
        if (utmCampaign) payload.push({ Attribute: 'SourceCampaign', Value: utmCampaign });

        console.log('Submitting lead:', { firstName, lastName, phone, email, status, goal, utmSource, utmMedium, utmCampaign });

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
                btnEl.textContent = 'Redirecting...';
                btnEl.style.backgroundColor = '#33A2B7';
                
                // Redirect to thank you page
                if (shouldDownload) {
                    window.location.href = 'thank-you.html?download=true';
                } else {
                    window.location.href = 'thank-you.html';
                }
            } else {
                let errText = await res.text();
                let isDuplicate = false;
                
                try {
                    const errData = JSON.parse(errText);
                    if (errData.ExceptionType === 'MXDuplicateEntryException') {
                        isDuplicate = true;
                    }
                } catch(e) {
                    // Not valid JSON
                }

                if (isDuplicate) {
                    console.log('Duplicate lead detected. Proceeding as success.');
                    btnEl.textContent = 'Redirecting...';
                    btnEl.style.backgroundColor = '#33A2B7';
                    if (shouldDownload) {
                        window.location.href = 'thank-you.html?download=true';
                    } else {
                        window.location.href = 'thank-you.html';
                    }
                } else {
                    console.error('LeadSquared error:', errText);
                    throw new Error('CRM error');
                }
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
            submitLead(popupForm, popupForm.querySelector('[type="submit"]'), currentIntent === 'brochure');
        });
    }

    // Attach to main CTA form
    const mainForm = document.querySelector('#apply .cta-form');
    if (mainForm) {
        mainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitLead(mainForm, mainForm.querySelector('[type="submit"]'), false);
        });
    }
});
