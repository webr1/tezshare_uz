// ============================================
// Upload Page JavaScript - Optimized Version
// ============================================

let uploadedFiles = new Map(); // Храним файлы: { up_id: { real_name, rowId, status, file } }
let totalFiles = 0;
let uploadedCount = 0;

// Get max size from hidden input
const MAX_SIZE = parseInt(document.getElementById('maxSize')?.value) || 209715200;

// Get CSRF token
const CSRF_TOKEN = document.getElementById('csrfToken')?.value || '';

// Get URLs
const CHUNK_UPLOAD_URL = document.getElementById('chunkUploadUrl')?.value || '';
const FINALIZE_BATCH_URL = document.getElementById('finalizeBatchUrl')?.value || '';

// Константы для параллельной загрузки
const CHUNK_SIZE = 1024 * 1024; // 1MB
const PARALLEL_CHUNKS = 3; // Количество одновременных чанков

// Настройки сжатия изображений
const IMAGE_COMPRESSION_OPTIONS = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
};

// Проверка и логирование
console.log('🔍 Upload Configuration:');
console.log('CSRF Token:', CSRF_TOKEN ? '✅ Found' : '❌ Missing');
console.log('Upload URL:', CHUNK_UPLOAD_URL || '❌ Missing');
console.log('Finalize URL:', FINALIZE_BATCH_URL || '❌ Missing');
console.log('Parallel chunks:', PARALLEL_CHUNKS);
console.log('Max file size:', formatFileSize ? formatFileSize(MAX_SIZE) : MAX_SIZE);

if (!CSRF_TOKEN) {
    console.error('❌ CRITICAL: CSRF Token not found!');
    alert('Ошибка: Не найден CSRF токен. Обновите страницу.');
}

if (!CHUNK_UPLOAD_URL || !FINALIZE_BATCH_URL) {
    console.error('❌ Upload URLs not configured!');
}

// ============================================
// Image Compression Function
// ============================================

async function compressImageIfNeeded(file) {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!imageTypes.includes(file.type)) {
        return file; // Не изображение - возвращаем как есть
    }
    
    if (file.size < 500 * 1024) {
        return file; // Меньше 500KB - не сжимаем
    }
    
    try {
        // Используем browser-image-compression если доступна
        if (typeof imageCompression !== 'undefined') {
            console.log(`📸 Сжимаю изображение: ${file.name}`);
            const compressedFile = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);
            console.log(`✅ Сжатие завершено: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
            return compressedFile;
        }
    } catch (error) {
        console.warn('⚠️ Ошибка сжатия, загружаю оригинал:', error);
    }
    
    return file;
}

// ============================================
// File Selection Handler
// ============================================

function handleFileSelect(input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    // Hide drop zone if first files
    if (uploadedFiles.size === 0) {
        document.getElementById('dropZone').style.display = 'none';
        document.getElementById('addMoreBtn').style.display = 'flex';
        document.getElementById('uploadOptions').style.display = 'block';
        document.getElementById('uploadStats').style.display = 'flex';
    }

    // Process each file (параллельно, не ждём завершения предыдущего)
    Array.from(files).forEach(file => {
        processFile(file); // НЕ используем await - файлы загружаются параллельно
    });

    // Clear input
    input.value = '';
}

// ============================================
// Process Single File
// ============================================

async function processFile(file) {
    console.log(`📂 Processing file: ${file.name} (${formatFileSize(file.size)})`);
    
    // КРИТИЧЕСКАЯ ПРОВЕРКА: Максимум 2GB для безопасности
    const ABSOLUTE_MAX_SIZE = 1 * 1024 * 1024 * 1024; // 1GB (изменено с 2GB)
    
    if (file.size > ABSOLUTE_MAX_SIZE) {
        showNotification(
            `⛔ Файл "${file.name}" слишком большой (${formatFileSize(file.size)})! Максимум: 1 GB. Это ограничение для стабильности сервера.`,
            'error'
        );
        console.error(`❌ File too large: ${file.name}`);
        return;
    }
    
    // Check file size against user limit
    if (file.size > MAX_SIZE) {
        const maxMB = (MAX_SIZE / (1024 * 1024)).toFixed(0);
        showNotification(
            `Файл "${file.name}" превышает ваш лимит! Максимальный размер: ${maxMB} МБ`,
            'error'
        );
        console.error(`❌ File exceeds user limit: ${file.name}`);
        return;
    }
    
    // ПРОВЕРКА НА ДУБЛИКАТЫ: Проверяем не загружается ли уже этот файл
    const existingFile = Array.from(uploadedFiles.values()).find(
        data => data.real_name === file.name && data.file && data.file.size === file.size
    );
    
    if (existingFile) {
        console.warn(`⚠️ Duplicate file detected: ${file.name}`);
        showNotification(
            `⚠️ Файл "${file.name}" уже добавлен в очередь!`,
            'warning'
        );
        return;
    }
    
    console.log(`✅ File passed all checks: ${file.name}`);

    totalFiles++;
    updateStats();

    // Генерируем уникальный ID
    const upId = 'up_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const rowId = 'row_' + upId;
    const queue = document.getElementById('fileQueue');

    // Сжимаем изображение если нужно (только если < 50MB)
    let processedFile = file;
    if (file.size < 50 * 1024 * 1024) { // Сжимаем только файлы < 50MB
        processedFile = await compressImageIfNeeded(file);
    }
    
    const originalSize = file.size;
    const processedSize = processedFile.size;
    
    let sizeInfo = formatFileSize(processedSize);
    if (originalSize > processedSize) {
        sizeInfo += ` <span style="color: var(--accent-green); font-size: 0.8em;">(сжато с ${formatFileSize(originalSize)})</span>`;
    }

    // Create file row with DELETE button
    const fileRow = document.createElement('div');
    fileRow.className = 'file-row';
    fileRow.id = rowId;
    fileRow.innerHTML = `
        <div class="file-icon">
            <i class="${getFileIcon(processedFile.name)}"></i>
        </div>
        <div class="file-info">
            <div class="file-name">${escapeHtml(processedFile.name)}</div>
            <div class="file-size">${sizeInfo}</div>
        </div>
        <div class="file-status">
            <div class="file-progress" id="progress_${rowId}" style="display: none;">
                <div class="file-progress-bar" id="progress_bar_${rowId}" style="width: 0%"></div>
            </div>
            <div class="file-loader" id="loader_${rowId}"></div>
            <div class="file-check" id="check_${rowId}" style="display: none;">
                <i class="fas fa-check"></i>
            </div>
            <button class="file-delete" id="delete_${rowId}" onclick="removeFile('${upId}')" title="Удалить файл">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    queue.appendChild(fileRow);

    // Сохраняем информацию о файле
    uploadedFiles.set(upId, {
        real_name: processedFile.name,
        rowId: rowId,
        status: 'uploading',
        file: processedFile
    });

    // Start upload with parallel chunks
    const success = await uploadInChunksParallel(processedFile, upId, rowId);

    if (success) {
        uploadedFiles.get(upId).status = 'completed';
        uploadedCount++;
        updateStats();
        updateFinishButton();
    } else {
        uploadedFiles.delete(upId);
        totalFiles--;
        updateStats();
    }
}


// ============================================
// Parallel Chunk Upload (С ЗАЩИТОЙ ОТ СБОЕВ СЕТИ)
// ============================================

async function uploadInChunksParallel(file, upId, rowId) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedChunks = 0;

    const progressDiv = document.getElementById(`progress_${rowId}`);
    const progressBar = document.getElementById(`progress_bar_${rowId}`);
    const loader = document.getElementById(`loader_${rowId}`);
    
    if (progressDiv && loader) {
        progressDiv.style.display = 'block';
        loader.style.display = 'none';
    }

    // Внутренняя функция загрузки одного чанка с логикой RE-TRY
    const uploadChunkWithRetry = async (chunkIndex, retries = 3) => {
        const offset = chunkIndex * CHUNK_SIZE;
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const fd = new FormData();
        
        fd.append('chunk', chunk);
        fd.append('upload_id', upId);
        fd.append('offset', offset);
        fd.append('total_size', file.size);
        fd.append('filename', file.name);

        try {
            const response = await fetch(CHUNK_UPLOAD_URL, {
                method: 'POST',
                body: fd,
                headers: {
                    'X-CSRFToken': CSRF_TOKEN,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error ${response.status}`);
            }

            // Успешно загружено
            uploadedChunks++;
            const progress = Math.round((uploadedChunks / totalChunks) * 100);
            if (progressBar) progressBar.style.width = progress + '%';

        } catch (err) {
            // Если произошла ошибка сети (как ERR_NETWORK_CHANGED)
            if (retries > 0) {
                console.warn(`⚠️ Ошибка на чанке ${chunkIndex}. Повтор через 2 сек... (Осталось попыток: ${retries})`);
                await new Promise(r => setTimeout(r, 2000));
                return uploadChunkWithRetry(chunkIndex, retries - 1); // Рекурсивный повтор
            }
            throw err; // Если попытки кончились, пробрасываем ошибку выше
        }
    };

    try {
        // Загружаем чанки пачками (PARALLEL_CHUNKS)
        for (let i = 0; i < totalChunks; i += PARALLEL_CHUNKS) {
            const chunkPromises = [];
            for (let j = 0; j < PARALLEL_CHUNKS && (i + j) < totalChunks; j++) {
                chunkPromises.push(uploadChunkWithRetry(i + j));
            }
            await Promise.all(chunkPromises); // Ждём выполнения текущей пачки
        }

        // Всё готово
        if (progressDiv) progressDiv.style.display = 'none';
        const check = document.getElementById(`check_${rowId}`);
        if (check) check.style.display = 'flex';
        return true;

    } catch (e) {
        console.error(`❌ Ошибка загрузки файла ${file.name}:`, e);
        showNotification(`Ошибка: ${e.message}. Проверьте интернет.`, 'error');
        
        if (loader) loader.style.display = 'none';
        if (progressDiv) progressDiv.style.display = 'none';
        const fileRow = document.getElementById(rowId);
        if (fileRow) fileRow.style.background = 'rgba(239, 68, 68, 0.1)';
        
        return false;
    }
}

// ============================================
// Remove File from Queue
// ============================================

function removeFile(upId) {
    if (!uploadedFiles.has(upId)) return;
    
    const fileData = uploadedFiles.get(upId);
    const fileRow = document.getElementById(fileData.rowId);
    
    if (fileRow) {
        // Анимация удаления
        fileRow.style.transition = 'all 0.3s ease';
        fileRow.style.opacity = '0';
        fileRow.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            fileRow.remove();
            
            // Обновляем счетчики
            if (fileData.status === 'completed') {
                uploadedCount--;
            }
            totalFiles--;
            uploadedFiles.delete(upId);
            
            updateStats();
            updateFinishButton();
            
            // Если файлов не осталось - показываем dropzone
            if (uploadedFiles.size === 0) {
                document.getElementById('dropZone').style.display = 'block';
                document.getElementById('addMoreBtn').style.display = 'none';
                document.getElementById('uploadOptions').style.display = 'none';
                document.getElementById('uploadStats').style.display = 'none';
            }
            
            showNotification('Файл удален из очереди', 'info');
        }, 300);
    }
}

// ============================================
// Finalize Batch (Updated for Celery)
// ============================================

async function finishBatch() {
    const btn = document.getElementById('finishBtn');
    const originalHTML = btn.innerHTML;
    
    // Проверяем есть ли завершенные загрузки
    const completedFiles = Array.from(uploadedFiles.entries())
        .filter(([_, data]) => data.status === 'completed');
    
    if (completedFiles.length === 0) {
        showNotification('Нет завершенных загрузок для создания ссылки', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner"></i> <span>Создание ссылки...</span>';

    const password = document.getElementById('passInput').value;
    
    // Подготавливаем данные для Celery (с реальными именами)
    const uploadIdsData = completedFiles.map(([upId, data]) => ({
        up_id: upId,
        real_name: data.real_name
    }));

    try {
        const response = await fetch(FINALIZE_BATCH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            },
            body: JSON.stringify({
                upload_ids: uploadIdsData.map(item => item.up_id), // Отправляем только IDs
                password: password,
                comment: document.getElementById('commInput').value
            })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            // Show result
            const resultSection = document.getElementById('result');
            const resLink = document.getElementById('resLink');
            const qrCode = document.getElementById('qrCode');
            const shortCodeText = document.getElementById('shortCodeText');
            const passwordStatus = document.getElementById('passwordStatus');
            
            // Set link
            resLink.href = data.download_url;
            resLink.textContent = data.download_url;
            
            // Set QR code
            if (qrCode && data.qr_code) {
                qrCode.src = data.qr_code;
            }
            
            // Set short code
            if (shortCodeText && data.short_code) {
                shortCodeText.textContent = data.short_code;
            }

            // Set password status
            if (passwordStatus) {
                if (password) {
                    passwordStatus.innerHTML = '<i class="fas fa-check"></i> С паролем';
                    passwordStatus.style.color = 'var(--accent-green)';
                } else {
                    passwordStatus.innerHTML = 'Без пароля';
                }
            }
            
            resultSection.style.display = 'block';
            
            // Hide upload section
            document.getElementById('fileQueue').style.display = 'none';
            document.getElementById('addMoreBtn').style.display = 'none';
            document.getElementById('uploadOptions').style.display = 'none';
            document.getElementById('uploadStats').style.display = 'none';
            btn.style.display = 'none';
            
            // Scroll to result
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Show success notification
            showNotification('Ссылка успешно создана! Файлы шифруются в фоновом режиме.', 'success');
            
            // Очищаем Map
            uploadedFiles.clear();
            
        } else {
            throw new Error(data.message || 'Неизвестная ошибка');
        }
        
    } catch (e) {
        showNotification('Ошибка при создании ссылки: ' + e.message, 'error');
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.innerHTML = originalHTML;
    }
}

// ============================================
// Update Functions
// ============================================

function updateFinishButton() {
    const btn = document.getElementById('finishBtn');
    if (!btn) return;
    
    const completedCount = Array.from(uploadedFiles.values())
        .filter(data => data.status === 'completed').length;
    
    if (completedCount > 0) {
        btn.disabled = false;
        btn.innerHTML = `
            <i class="fas fa-link"></i>
            <span>Создать ссылку (${completedCount} ${getFileWord(completedCount)})</span>
            <div class="button-shine"></div>
        `;
    } else {
        btn.disabled = true;
        btn.innerHTML = `
            <i class="fas fa-link"></i>
            <span>Создать ссылку (0 файлов)</span>
        `;
    }
}

function updateStats() {
    const uploadedElement = document.getElementById('uploadedCount');
    const remainingElement = document.getElementById('remainingCount');
    const totalSizeElement = document.getElementById('totalSize');
    
    if (uploadedElement) uploadedElement.textContent = uploadedCount;
    if (remainingElement) remainingElement.textContent = totalFiles - uploadedCount;
    
    // Calculate total size
    if (totalSizeElement) {
        let totalBytes = 0;
        uploadedFiles.forEach(data => {
            if (data.file) {
                totalBytes += data.file.size;
            }
        });
        totalSizeElement.textContent = formatFileSize(totalBytes);
    }
}

// ============================================
// Drag & Drop Handlers
// ============================================

function initDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

async function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files && files.length > 0) {
        // Обрабатываем файлы параллельно
        Array.from(files).forEach(file => {
            processFile(file);
        });
    }
}

// ============================================
// Password Toggle
// ============================================

function togglePasswordVisibility() {
    const passInput = document.getElementById('passInput');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (!passInput || !eyeIcon) return;
    
    if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// ============================================
// Copy Short Code Function
// ============================================

function copyShortCode() {
    const shortCodeText = document.getElementById('shortCodeText');
    if (!shortCodeText) return;
    
    const code = shortCodeText.textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            showShortCodeCopiedState();
            showNotification('Код скопирован: ' + code, 'success');
        });
    } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        showShortCodeCopiedState();
        showNotification('Код скопирован: ' + code, 'success');
    }
}

function showShortCodeCopiedState() {
    const copyBtn = document.querySelector('.short-code-copy');
    if (!copyBtn) return;
    
    const icon = copyBtn.querySelector('i');
    if (icon) {
        icon.className = 'fas fa-check';
        copyBtn.style.background = 'var(--accent-green)';
        
        setTimeout(() => {
            icon.className = 'fas fa-copy';
            copyBtn.style.background = '';
        }, 2000);
    }
}

// ============================================
// Download QR Code Function
// ============================================

function downloadQR() {
    const qrCode = document.getElementById('qrCode');
    if (!qrCode || !qrCode.src) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = qrCode.src;
    link.download = 'tezshare-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('QR-код скачан!', 'success');
}

// ============================================
// Copy Link Function
// ============================================

function copyResultLink() {
    const resLink = document.getElementById('resLink');
    if (!resLink) return;
    
    const link = resLink.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            showCopiedState();
            showNotification('Ссылка скопирована в буфер обмена!', 'success');
        });
    } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        showCopiedState();
        showNotification('Ссылка скопирована!', 'success');
    }
}

function showCopiedState() {
    const copyBtn = document.querySelector('.copy-button');
    if (!copyBtn) return;
    
    const originalHTML = copyBtn.innerHTML;
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = '<i class="fas fa-check"></i> <span>Скопировано!</span>';
    
    setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = originalHTML;
    }, 2000);
}

// ============================================
// Share Link Function
// ============================================

function shareLink() {
    const resLink = document.getElementById('resLink');
    if (!resLink) return;
    
    const link = resLink.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'TezShare - Файлы',
            text: 'Скачайте файлы по этой ссылке:',
            url: link
        }).catch(err => {
            console.log('Share cancelled');
        });
    } else {
        // Fallback to copy
        copyResultLink();
    }
}

// ============================================
// Utility Functions
// ============================================

function getFileIcon(filename) {
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

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'файлов';
    }
    
    if (lastDigit === 1) {
        return 'файл';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'файла';
    }
    
    return 'файлов';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message, type = 'info') {
    if (window.TezShare && window.TezShare.notify) {
        window.TezShare.notify(message, type);
    } else {
        alert(message);
    }
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    
    // ИСПРАВЛЕНО: НЕ добавляем обработчик здесь, т.к. он уже есть в HTML через onchange
    // Это вызывало дублирование файлов!
    
    console.log('✅ Upload page initialized');
    console.log('📦 Max file size:', formatFileSize(MAX_SIZE));
    console.log('⚡ Parallel chunks:', PARALLEL_CHUNKS);
    console.log('🛡️ Absolute max (safety): 2 GB');
    
    // Проверка доступности библиотеки сжатия
    if (typeof imageCompression !== 'undefined') {
        console.log('✅ Image compression library loaded');
    } else {
        console.warn('⚠️ Image compression library not available (images will be uploaded without compression)');
    }
});

// ============================================
// Expose Functions Globally
// ============================================

window.handleFileSelect = handleFileSelect;
window.finishBatch = finishBatch;
window.togglePasswordVisibility = togglePasswordVisibility;
window.copyResultLink = copyResultLink;
window.copyShortCode = copyShortCode;
window.downloadQR = downloadQR;
window.shareLink = shareLink;
window.removeFile = removeFile; // Новая функция!