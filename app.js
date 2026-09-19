// مفتاح الـ API الخاص بـ Hugging Face (استبدله بمفتاحك)
const API_KEY = "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; 
const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const messagesList = document.getElementById('messagesList');

// إرسال الرسالة عند الضغط على الزر
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

    // إخفاء شاشة الترحيب
    welcomeScreen.style.display = 'none';

    // إضافية رسالة المستخدم
    appendMessage(text, 'user-message');
    userInput.value = '';

    // إضافة مؤشر انتظار
    const loadingId = appendMessage("جاري التفكير...", 'bot-message');

    // استدعاء الـ API
    try {
        const response = await fetch(MODEL_URL, {
            headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ inputs: text }),
        });
        const result = await response.json();
        
        // تحديث رسالة البوت بالرد
        const botReply = result[0]?.generated_text || "حدث خطأ أثناء معالجة الطلب.";
        document.getElementById(loadingId).innerText = botReply;
    } catch (error) {
        document.getElementById(loadingId).innerText = "خطأ في الاتصال بالخادم.";
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

// -------------------------------------------------------------
// إدارة تسجيل الدخول وتخزين بيانات المستخدمين بنمط JSON
// -------------------------------------------------------------
function saveUserToJSON(username, email) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    users.push({ username, email, loginTime: new Date().toISOString() });
    localStorage.getItem('users_db', JSON.stringify(users));
}
