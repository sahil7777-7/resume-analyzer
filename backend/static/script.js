document.addEventListener('DOMContentLoaded', () => {
    const form          = document.getElementById('analyze-form');
    const fileInput     = document.getElementById('resume');
    const dropZone      = document.getElementById('drop-zone');
    const browseBtn     = document.getElementById('browse-btn');
    const dzPrimary     = document.getElementById('dz-primary');
    const submitBtn     = document.getElementById('submit-btn');
    const btnText       = submitBtn.querySelector('.btn-text');
    const btnArrow      = submitBtn.querySelector('.btn-arrow');
    const resultSection = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');
    const formCard      = document.querySelector('.form-card');

    /* ── File helpers ──────────────────────────────────── */
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', () => validateAndSet(fileInput.files[0]));

    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt =>
        dropZone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); })
    );

    ['dragenter', 'dragover'].forEach(evt =>
        dropZone.addEventListener(evt, () => dropZone.classList.add('dragover'))
    );

    ['dragleave', 'drop'].forEach(evt =>
        dropZone.addEventListener(evt, () => dropZone.classList.remove('dragover'))
    );

    dropZone.addEventListener('drop', e => {
        const file = e.dataTransfer.files[0];
        if (file) validateAndSet(file);
    });

    function validateAndSet(file) {
        if (!file) return;

        if (file.type !== 'application/pdf') {
            showFileError('Only PDF files are accepted.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showFileError('File exceeds the 10MB limit.');
            return;
        }

        // Transfer to input if dropped
        try {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
        } catch(e) { /* Safari fallback — file already set */ }

        // Update UI
        dzPrimary.textContent = file.name;
        dzPrimary.style.color = 'var(--accent)';
        dropZone.style.borderColor = 'var(--accent)';
    }

    function showFileError(msg) {
        fileInput.value = '';
        dzPrimary.textContent = 'Drop your PDF here';
        dzPrimary.style.color = '';
        dropZone.style.borderColor = '';
        alert(msg);
    }

    /* ── Form submit ───────────────────────────────────── */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please upload a PDF resume before analyzing.');
            return;
        }

        // Loading state
        setLoading(true);
        resultSection.classList.add('hidden');
        resultContent.innerHTML = '';

        const formData = new FormData(form);

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            const rawText = await response.text();

            if (!response.ok) {
                let errorMsg = 'Something went wrong. Please try again.';
                try {
                    const errJson = JSON.parse(rawText);
                    if (errJson.error) errorMsg = errJson.error;
                } catch (_) {
                    errorMsg = rawText || errorMsg;
                }
                throw new Error(errorMsg);
            }

            // Parse result — plain markdown or JSON wrapper
            let mdText = rawText;
            try {
                const parsed = JSON.parse(rawText);
                if (parsed.result) mdText = parsed.result;
            } catch (_) { /* treat as markdown */ }

            resultContent.innerHTML = marked.parse(mdText);
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (err) {
            resultContent.innerHTML = `<div class="error-msg"><strong>Error:</strong> ${err.message}</div>`;
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } finally {
            setLoading(false);
        }
    });

    function setLoading(on) {
        if (on) {
            submitBtn.disabled = true;
            btnText.textContent = 'Reading your resume\u2026';
            btnArrow.classList.add('hidden');

            // Add loading bar to form card
            if (!formCard.querySelector('.loading-bar')) {
                const bar = document.createElement('div');
                bar.className = 'loading-bar';
                formCard.insertAdjacentElement('afterbegin', bar);
            }
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Analyze my resume';
            btnArrow.classList.remove('hidden');

            const bar = formCard.querySelector('.loading-bar');
            if (bar) bar.remove();
        }
    }
});
