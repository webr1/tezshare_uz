    // ============================================
// Download Page JavaScript
// ============================================

class DownloadPage {
    constructor() {
        this.init();
    }

    init() {
        this.initDownloadTracking();
        this.initFileIcons();
        this.checkExpiration();
    }

    // ============================================
    // Download Tracking
    // ============================================
    initDownloadTracking() {
        // Track download all button
        const downloadAllBtn = document.querySelector('.download-all-btn');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', (e) => {
                this.trackDownload('all_files', 'zip');
                this.showDownloadNotification('Начинается загрузка архива...');
            });
        }

        // Track individual file downloads
        const fileDownloadBtns = document.querySelectorAll('.file-download-btn');
        fileDownloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileName = btn.closest('.file-item')?.querySelector('.file-name')?.textContent;
                this.trackDownload(fileName, 'individual');
                this.showDownloadNotification(`Загрузка файла "${fileName}"...`);
            });
        });
    }

    trackDownload(fileName, type) {
        // Analytics tracking (можно добавить Google Analytics или другую систему)
        console.log(`Download tracked: ${fileName} (${type})`);
        
        // Можно отправить на сервер для статистики
        // fetch('/api/track-download', { ... })
    }

    showDownloadNotification(message) {
        if (window.TezShare && window.TezShare.notify) {
            window.TezShare.notify(message, 'info', 3000);
        }
    }

    // ============================================
    // File Icons Enhancement
    // ============================================
    initFileIcons() {
        const fileItems = document.querySelectorAll('.file-item');
        
        fileItems.forEach(item => {
            const fileName = item.querySelector('.file-name')?.textContent || '';
            const icon = this.getFileIcon(fileName);
            const iconElement = item.querySelector('.file-icon i');
            
            if (iconElement && !iconElement.className.includes('fa-')) {
                iconElement.className = icon;
            }

            // Add color based on file type
            const fileIcon = item.querySelector('.file-icon');
            if (fileIcon) {
                const color = this.getFileColor(fileName);
                fileIcon.style.background = color;
            }
        });
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        const iconMap = {
            // Images
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'gif': 'fas fa-file-image',
            'svg': 'fas fa-file-image',
            'webp': 'fas fa-file-image',
            
            // Videos
            'mp4': 'fas fa-file-video',
            'avi': 'fas fa-file-video',
            'mov': 'fas fa-file-video',
            'mkv': 'fas fa-file-video',
            
            // Audio
            'mp3': 'fas fa-file-audio',
            'wav': 'fas fa-file-audio',
            'flac': 'fas fa-file-audio',
            
            // Documents
            'pdf': 'fas fa-file-pdf',
            'doc': 'fas fa-file-word',
            'docx': 'fas fa-file-word',
            'xls': 'fas fa-file-excel',
            'xlsx': 'fas fa-file-excel',
            'ppt': 'fas fa-file-powerpoint',
            'pptx': 'fas fa-file-powerpoint',
            
            // Archives
            'zip': 'fas fa-file-archive',
            'rar': 'fas fa-file-archive',
            '7z': 'fas fa-file-archive',
            'tar': 'fas fa-file-archive',
            'gz': 'fas fa-file-archive',
            
            // Code
            'html': 'fas fa-file-code',
            'css': 'fas fa-file-code',
            'js': 'fas fa-file-code',
            'py': 'fas fa-file-code',
            'java': 'fas fa-file-code',
            'php': 'fas fa-file-code',
            
            // Text
            'txt': 'fas fa-file-alt',
            'md': 'fas fa-file-alt'
        };
        
        return iconMap[ext] || 'fas fa-file';
    }

    getFileColor(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        const colorMap = {
            // Images - Purple
            'jpg': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            'jpeg': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            'png': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            'gif': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            'svg': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            'webp': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            
            // Videos - Red
            'mp4': 'linear-gradient(135deg, #ef4444, #f87171)',
            'avi': 'linear-gradient(135deg, #ef4444, #f87171)',
            'mov': 'linear-gradient(135deg, #ef4444, #f87171)',
            'mkv': 'linear-gradient(135deg, #ef4444, #f87171)',
            
            // Audio - Pink
            'mp3': 'linear-gradient(135deg, #ec4899, #f472b6)',
            'wav': 'linear-gradient(135deg, #ec4899, #f472b6)',
            'flac': 'linear-gradient(135deg, #ec4899, #f472b6)',
            
            // Documents - Blue
            'pdf': 'linear-gradient(135deg, #ef4444, #dc2626)',
            'doc': 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            'docx': 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            'xls': 'linear-gradient(135deg, #10b981, #34d399)',
            'xlsx': 'linear-gradient(135deg, #10b981, #34d399)',
            'ppt': 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            'pptx': 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            
            // Archives - Orange
            'zip': 'linear-gradient(135deg, #f97316, #fb923c)',
            'rar': 'linear-gradient(135deg, #f97316, #fb923c)',
            '7z': 'linear-gradient(135deg, #f97316, #fb923c)',
            'tar': 'linear-gradient(135deg, #f97316, #fb923c)',
            'gz': 'linear-gradient(135deg, #f97316, #fb923c)',
            
            // Code - Cyan
            'html': 'linear-gradient(135deg, #06b6d4, #22d3ee)',
            'css': 'linear-gradient(135deg, #06b6d4, #22d3ee)',
            'js': 'linear-gradient(135deg, #06b6d4, #22d3ee)',
            'py': 'linear-gradient(135deg, #06b6d4, #22d3ee)',
            'java': 'linear-gradient(135deg, #06b6d4, #22d3ee)',
            'php': 'linear-gradient(135deg, #06b6d4, #22d3ee)',
            
            // Text - Gray
            'txt': 'linear-gradient(135deg, #6b7280, #9ca3af)',
            'md': 'linear-gradient(135deg, #6b7280, #9ca3af)'
        };
        
        return colorMap[ext] || 'linear-gradient(135deg, var(--primary-600), var(--primary-400))';
    }

    // ============================================
    // Check Expiration
    // ============================================
    checkExpiration() {
        // Get expiration date from info card
        const expirationText = document.querySelector('.info-value')?.textContent;
        if (!expirationText) return;

        // Parse date (format: DD.MM.YYYY HH:MM)
        const parts = expirationText.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
        if (!parts) return;

        const expirationDate = new Date(
            parseInt(parts[3]), // year
            parseInt(parts[2]) - 1, // month (0-indexed)
            parseInt(parts[1]), // day
            parseInt(parts[4]), // hour
            parseInt(parts[5])  // minute
        );

        const now = new Date();
        const timeLeft = expirationDate - now;

        // If expired
        if (timeLeft <= 0) {
            this.showExpiredState();
            return;
        }

        // If less than 1 hour left
        if (timeLeft < 3600000) { // 1 hour in milliseconds
            this.showExpiringWarning(timeLeft);
        }

        // Start countdown if needed
        this.startCountdown(expirationDate);
    }

    showExpiredState() {
        const downloadAllBtn = document.querySelector('.download-all-btn');
        const fileDownloadBtns = document.querySelectorAll('.file-download-btn');

        if (downloadAllBtn) {
            downloadAllBtn.style.pointerEvents = 'none';
            downloadAllBtn.style.opacity = '0.5';
            downloadAllBtn.innerHTML = `
                <div class="download-all-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="download-all-content">
                    <div class="download-all-title">Срок хранения истёк</div>
                    <div class="download-all-subtitle">Файлы больше недоступны для скачивания</div>
                </div>
            `;
        }

        fileDownloadBtns.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.innerHTML = '<i class="fas fa-clock"></i> <span>Истёк срок</span>';
        });

        if (window.TezShare && window.TezShare.notify) {
            window.TezShare.notify('Срок хранения файлов истёк', 'error');
        }
    }

    showExpiringWarning(timeLeft) {
        const minutes = Math.floor(timeLeft / 60000);
        
        if (window.TezShare && window.TezShare.notify) {
            window.TezShare.notify(
                `Внимание! Файлы будут удалены через ${minutes} ${this.getMinutesWord(minutes)}`,
                'warning',
                5000
            );
        }
    }

    startCountdown(expirationDate) {
        // Optional: можно добавить таймер обратного отсчета
        // setInterval(() => { ... }, 1000);
    }

    getMinutesWord(count) {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'минут';
        }
        
        if (lastDigit === 1) {
            return 'минуту';
        }
        
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'минуты';
        }
        
        return 'минут';
    }
}

// ============================================
// Utility: Copy Link
// ============================================

function copyCurrentLink() {
    const link = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            if (window.TezShare && window.TezShare.notify) {
                window.TezShare.notify('Ссылка скопирована!', 'success');
            }
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (window.TezShare && window.TezShare.notify) {
            window.TezShare.notify('Ссылка скопирована!', 'success');
        }
    }
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const downloadPage = new DownloadPage();
    
    // Expose globally
    window.DownloadPage = downloadPage;
    window.copyCurrentLink = copyCurrentLink;
    
    console.log('Download page initialized');
});