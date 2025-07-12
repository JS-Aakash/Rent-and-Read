document.addEventListener('DOMContentLoaded', () => {
    const userInputEl = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-output");
    const sendBtn = document.getElementById("chat-send-btn");

    window.sendMessageToBot = async function () {
        const userInput = userInputEl.value.trim();
        if (!userInput) return;

        appendMessage("You", userInput);
        userInputEl.value = "";
        sendBtn.disabled = true;

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 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",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: ""
                        },
                        {
                            role: "user",
                            content: userInput
                        }
                    ]
                })
            });

            const data = await response.json();
            console.log("OpenRouter response:", data);

            if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
                appendMessage("Bot", data.choices[0].message.content.trim());
            } else {
                appendMessage("Bot", "Sorry, I didn’t understand that.");
            }
        } catch (error) {
            console.error("Error:", error);
            appendMessage("Bot", "Something went wrong. Please try again later.");
        } finally {
            sendBtn.disabled = false;
            userInputEl.focus();
        }
    };

    function appendMessage(sender, message) {
        const messageEl = document.createElement("div");
        messageEl.textContent = `${sender}: ${message}`;
        messageEl.className = sender === "You" ? "chat-message user-message" : "chat-message bot-message";
        chatBox.appendChild(messageEl);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
