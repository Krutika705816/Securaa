document.addEventListener("DOMContentLoaded", function () {
    const sosButton = document.querySelector(".sos-btn");

    // Double Click Event for SOS Button
    sosButton.addEventListener("dblclick", function () {
        alert("🚨 SOS Activated! Sending emergency alerts...");
        
        getUserLocation(locationUrl => {
            sendWhatsAppMessage(locationUrl);
            sendSMSMessage(locationUrl);
            startRecording(); // Auto start 20-second recording
        });
    });

    // Function to Get User's Current Location
    function getUserLocation(callback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                callback(locationUrl);
            }, error => {
                alert("⚠️ Location access denied. Enable location services.");
            });
        } else {
            alert("❌ Geolocation is not supported by this browser.");
        }
    }

    // Function to Send WhatsApp Message
    function sendWhatsAppMessage(locationUrl) {
        const message = "🚨 *EMERGENCY ALERT* 🚨\nPlease Help Me! I Am In Danger.\nMy Location: " + locationUrl;
        const contacts = JSON.parse(localStorage.getItem("emergencyContacts")) || [];

        if (contacts.length === 0) {
            alert("⚠️ No emergency contacts found. Please add them in settings.");
            return;
        }

        contacts.forEach(contact => {
            let phoneNumber = contact.phone.replace(/\D/g, '');
            if (phoneNumber) {
                let whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank'); // Open WhatsApp
            }
        });
    }

    // Function to Send SMS Message
    function sendSMSMessage(locationUrl) {
        const message = "🚨 *EMERGENCY ALERT* 🚨\nPlease Help Me! I Am In Danger.\nMy Location: " + locationUrl;
        const contacts = JSON.parse(localStorage.getItem("emergencyContacts")) || [];

        if (contacts.length === 0) {
            alert("⚠️ No emergency contacts found. Please add them in settings.");
            return;
        }

        contacts.forEach(contact => {
            let phoneNumber = contact.phone.replace(/\D/g, '');
            if (phoneNumber) {
                let smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
                window.open(smsUrl); // Open SMS app
            }
        });
    }

    // Function to Start 20-Second Background Recording and Auto-Save
    let mediaRecorder;
    let audioChunks = [];

    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

                // Save Recording in Local Storage
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = function () {
                    localStorage.setItem("sosRecording", reader.result);
                    alert("🎤 SOS Recording saved automatically.");
                };
            };

            mediaRecorder.start();
            alert("🎙️ Recording started...");

            // Stop recording after 20 seconds
            setTimeout(() => {
                mediaRecorder.stop();
                alert("🎤 Recording stopped after 20 seconds.");
            }, 20000);
        }).catch(error => {
            alert("❌ Microphone access denied.");
        });
    }
});
