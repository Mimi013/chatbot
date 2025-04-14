const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const closeButton = document.querySelector("#close-chatbot");
const chatbotPopup = document.querySelector("#chatbotPopup");
const voiceButton = document.querySelector(".voice-button");
const toggleVoiceButton = document.querySelector("#toggle-voice");
const voiceIcon = document.querySelector("#voice-icon");

let data = [];
let isVoiceEnabled = false; 

fetch('responses.json')
    .then(response => response.json())
    .then(json => {
        data = json;
        console.log("Données JSON chargées :", data);
    })
    .catch(error => {
        console.error("Erreur lors du chargement du fichier JSON :", error);
    });

const userData = {
    message: null
};

// défiler le chat vers le bas
const scrollToBottom = () => {
    requestAnimationFrame(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
    });
};



const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};


const generateBotResponse = async (incomingMessageDiv) => {
    const messageTextDiv = incomingMessageDiv.querySelector(".message-text");

    const found = data.find(item => {
        return item.question.some(q => userData.message.toLowerCase().includes(q.toLowerCase()));
    });

    const botResponse = found ? found.reponse : "Je suis ton meilleur ami virtuel 😊, je suis là pour t'aider autant que possible !.";

    incomingMessageDiv.classList.remove("thinking");

    typeText(messageTextDiv, botResponse, 50);

    if (isVoiceEnabled) {
        setTimeout(() => {
            speak(botResponse);
        }, botResponse.length * 50 + 500); 
    }
};

function typeText(element, text, speed = 50) {
    let index = 0;
    function typing() {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(typing, speed);
        }
    }
    typing();
}

function speak(text) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    speechSynthesis.speak(utterance);
}

const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";

    if (!userData.message) return;
    const outgoingMessageDiv = createMessageElement(`<div class="message-text">${userData.message}</div>`, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    scrollToBottom();

    setTimeout(() => {
        const incomingMessageDiv = createMessageElement(`
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        scrollToBottom();

        generateBotResponse(incomingMessageDiv);
    }, 300);
};

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
        handleOutgoingMessage(e);
    }
});

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));

closeButton.addEventListener("click", () => {
    chatbotPopup.style.display = (chatbotPopup.style.display === "none" ? "block" : "none");
});

toggleVoiceButton.addEventListener("click", () => {
    isVoiceEnabled = !isVoiceEnabled;
    voiceIcon.textContent = isVoiceEnabled ? "volume_up" : "volume_off";
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = "fr-FR"; 

const startVoiceRecognition = () => {
    recognition.start();
    voiceButton.style.backgroundColor = "#3d39ac";
    voiceButton.style.color = "#fff";
};

const adjustTextAreaHeight = () => {
    messageInput.style.height = 'auto'; // Réinitialiser la hauteur
    messageInput.style.height = messageInput.scrollHeight + 'px'; // Ajuster à la hauteur du contenu
};

messageInput.addEventListener("input", adjustTextAreaHeight);

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    messageInput.value = transcript;
    handleOutgoingMessage(new Event('submit'));
};

recognition.onerror = (event) => {
    console.error("Erreur de reconnaissance vocale : ", event.error);
};

recognition.onend = () => {
    voiceButton.style.backgroundColor = "";
    voiceButton.style.color = "";
};

voiceButton.addEventListener("click", startVoiceRecognition);

document.addEventListener('DOMContentLoaded', () => {
    const openChatbot = document.getElementById('open-chatbot');
    openChatbot.addEventListener('click', () => {
        chatbotPopup.style.display = 'block';
    });
});
