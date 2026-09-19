document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatContainer = document.getElementById('chatContainer');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const messagesList = document.getElementById('messagesList');

    const keyModal = document.getElementById('keyModal');
    const openKeyModalBtn = document.getElementById('openKeyModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const userApiKeyInput = document.getElementById('userApiKeyInput');

    // إعدادات Modal المفتاح
    if (openKeyModalBtn) {
        openKeyModalBtn.addEventListener('click', () => {
            userApiKeyInput.value = localStorage.getItem('custom_gemini_key') || '';
            keyModal.style.display = 'flex';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            keyModal.style.display = 'none';
        });
    }

    if (saveKeyBtn) {
        saveKeyBtn.addEventListener('click', () => {
            const key = userApiKeyInput.value.trim();
            if (key) {
                localStorage.setItem('custom_gemini_key', key);
                alert('تم حفظ المفتاح بنجاح!');
            } else {
                localStorage.removeItem('custom_gemini_key');
                alert('تم إزالة المفتاح الشخصي.');
            }
            keyModal.style.display = 'none';
        });
    }

    // إرسال الرسائل
    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
    }

    async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    if (welcomeScreen) welcomeScreen.style.display = 'none';

    appendMessage(text, 'user-message');
    userInput.value = '';

    const loadingId = appendMessage("جاري التفكير...", 'bot-message');
    const customKey = localStorage.getItem('custom_gemini_key');

    if (!customKey) {
        document.getElementById(loadingId).innerText = "يرجى الضغط على زر (إدخال Gemini API Key) في الأعلى وإدخال مفتاحك المجاني للبدء.";
        return;
    }

    try {
        // استخدام gemini-1.5-flash-latest مع حيلة تجاوز الكاش
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${customKey}&nocache=${Date.now()}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            const reply = data.candidates[0].content.parts[0].text;
            document.getElementById(loadingId).innerText = reply;
        } else {
            document.getElementById(loadingId).innerText = "خطأ: " + (data.error?.message || "تأكد من صحة المفتاح الخاص بك.");
        }

    } catch (error) {
        console.error(error);
        document.getElementById(loadingId).innerText = "حدث خطأ أثناء الاتصال بالخادم.";
    }
}


    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');
        const id = 'msg-' + Date.now();
        msgDiv.id = id;
        msgDiv.className = `message ${className}`;
        msgDiv.innerText = text;
        messagesList.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return id;
    }
});
