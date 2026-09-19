const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const messagesList = document.getElementById('messagesList');

// العناصر الخاصة بـ Modal المايكرو
const keyModal = document.getElementById('keyModal');
const openKeyModalBtn = document.getElementById('openKeyModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const userApiKeyInput = document.getElementById('userApiKeyInput');

// إدارة فتح وإغلاق النافذة المنبثقة
openKeyModalBtn.addEventListener('click', () => {
    userApiKeyInput.value = localStorage.getItem('custom_openai_key') || '';
    keyModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    keyModal.style.display = 'none';
});

saveKeyBtn.addEventListener('click', () => {
    const key = userApiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('custom_openai_key', key);
        alert('تم حفظ المفتاح الخاص بك بنجاح!');
    } else {
        localStorage.removeItem('custom_openai_key');
        alert('تمت إزالة المفتاح الخاص، سيتم استخدام المفتاح العام إن وجد.');
    }
    keyModal.style.display = 'none';
});

// إرسال الرسالة
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    if (welcomeScreen) welcomeScreen.style.display = 'none';

    appendMessage(text, 'user-message');
    userInput.value = '';

    const loadingId = appendMessage("جاري التفكير...", 'bot-message');

    // التحقق هل لدى المستخدم مفتاح خاص محلي
    const customKey = localStorage.getItem('custom_openai_key');

    try {
        let reply = "";

        if (customKey) {
            // الخيار 1: الاتصال المباشر باستخدام مفتاح المستخدم الشخصي
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
            // الخيار 2: استخدام Netlify Function (مفتاح المشرف الآمن في Netlify)
            const response = await fetch("/.netlify/functions/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: text })
            });

            const data = await response.json();
            if (response.ok) {
                reply = data.choices[0].message.content;
            } else {
                reply = "يرجى إدخال API Key الخاص بك للبدء في استخدام الموقع.";
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
