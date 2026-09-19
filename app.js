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
            userApiKeyInput.value = localStorage.getItem('custom_openai_key') || '';
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
                localStorage.setItem('custom_openai_key', key);
                alert('تم حفظ المفتاح بنجاح!');
            } else {
                localStorage.removeItem('custom_openai_key');
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
        const customKey = localStorage.getItem('custom_openai_key');

        try {
            let reply = "";

            if (customKey) {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${customKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [
                            { role: "system", content: "أنت مساعد ذكي ولطيف." },
                            { role: "user", content: text }
                        ]
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    reply = data.choices[0].message.content;
                } else {
                    reply = "خطأ في المفتاح الخاص بك: " + (data.error?.message || "تأكد من صحة المفتاح");
                }
            } else {
                // الاتصال بـ Netlify Function إذا لم يضع المستخدم مفتاحاً خاصاً
                const response = await fetch("/.netlify/functions/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: text })
                });

                const data = await response.json();
                if (response.ok) {
                    reply = data.choices[0].message.content;
                } else {
                    reply = "يرجى الضغط على زر (إدخال API Key) في الأعلى وإدخال مفتاح OpenAI الخاص بك للبدء.";
                }
            }

            document.getElementById(loadingId).innerText = reply;

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
