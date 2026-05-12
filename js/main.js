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

    // Close button click
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
        });
    }

    // Close on click outside the popup content
    if(popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('show');
            }
        });
    }
});
