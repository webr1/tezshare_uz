// Belgilar sanagichi
const messageTextarea = document.getElementById('message');
const charCount = document.getElementById('charCount');

messageTextarea.addEventListener('input', function() {
    const count = this.value.length;
    charCount.textContent = count;
    
    if (count > 1900) {
        charCount.style.color = '#f44336';
    } else if (count > 1500) {
        charCount.style.color = '#ff9800';
    } else {
        charCount.style.color = '#9ca3af';
    }
});

// Formani yuborish
const feedbackForm = document.getElementById('feedbackForm');
const submitBtn = document.getElementById('submitBtn');

feedbackForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Yuklash holati
    submitBtn.classList.add('loading');
    submitBtn.querySelector('span').textContent = 'Yuborilmoqda...';
    submitBtn.querySelector('i').className = 'fas fa-spinner';
    
    // Form ma'lumotlarini olish
    const formData = new FormData(feedbackForm);
    
    // AJAX orqali yuborish
    fetch(feedbackForm.action || window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Muvaffaqiyatli yuborildi
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            submitBtn.querySelector('span').textContent = 'Yuborildi!';
            submitBtn.querySelector('i').className = 'fas fa-check';
            
            // Formani tozalash
            setTimeout(() => {
                feedbackForm.reset();
                charCount.textContent = '0';
                
                // Toast xabar
                showToast('Xabaringiz muvaffaqiyatli yuborildi! Tez orada javob beramiz.', 'success');
                
                // Tugmani asl holatga qaytarish
                setTimeout(() => {
                    submitBtn.classList.remove('success');
                    submitBtn.querySelector('span').textContent = 'Xabarni yuborish';
                    submitBtn.querySelector('i').className = 'fas fa-paper-plane';
                }, 2000);
            }, 1000);
        } else {
            throw new Error(data.error || 'Xatolik yuz berdi');
        }
    })
    .catch(error => {
        console.error('Xatolik:', error);
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('span').textContent = 'Xabarni yuborish';
        submitBtn.querySelector('i').className = 'fas fa-paper-plane';
        
        showToast('Xabar yuborishda xatolik. Iltimos, qayta urinib ko\'ring.', 'error');
    });
});

// Toast xabar ko'rsatish
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : type === 'error' ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 4000);
}

// Animatsiya stillari
if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}