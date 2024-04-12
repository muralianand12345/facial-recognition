const webCamElement = document.getElementById("webCam");
const canvasElement = document.getElementById("canvas");
const webcam = new Webcam(webCamElement, 'user', canvasElement);
webcam.start();

const showNotification = async (message, time) => {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, time || 3000);
}

const showLoader = () => {
    const loader = document.querySelector('.loader');
    loader.style.display = 'block';
}

const hideLoader = () => {
    const loader = document.querySelector('.loader');
    loader.style.display = 'none';
}

const sendOTP = async () => {

    let email = document.getElementById("email").value;

    if (!email) {
        showNotification("Please enter email!", 3000);
        return;
    }

    if (!email.includes("@")) {
        showNotification("Please enter a valid email!", 3000);
        return;
    }

    const response = await fetch("./api/register/guest/otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email
        })
    });

    if (response.ok) {
        const data = await response.json();
        showNotification(data.message, 3000);
    } else {
        showNotification("Failed to send OTP!", 3000);
    }

};

const startCapture = async () => {

    let email = document.getElementById("email").value;
    let otp = document.getElementById("otp").value;

    if (!email) {
        showNotification("Please enter email!", 3000);
        return;
    }

    if (!otp) {
        showNotification("Please enter OTP!", 3000);
        return;
    }

    if (!email.includes("@")) {
        showNotification("Please enter a valid email!", 3000);
        return;
    }

    const response = await fetch("./api/register/guest", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            otp
        })
    });

    if (response.ok) {
        const data = await response.json();

        if (data.guestName) {

            showLoader();

            let total_img = 10;

            for (let i = 0; i < total_img; i++) {
                const name = data.guestName;
                const image = await webcam.snap();

                const response = await fetch("http://localhost:5000/image", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        image
                    })
                });

                const dataPy = await response.json();

                if (dataPy.status === "success") {
                    await showNotification(`Image ${i + 1} captured successfully! | Status: ${dataPy.status}`, 3000);
                } else {
                    await showNotification(`Image ${i + 1} failed to capture! | Status: ${dataPy.status}`, 3000);
                    hideLoader();
                    return;
                }
            }

            hideLoader();
        }
    } else {
        showNotification("Kindly verify your email first!", 3000);
    }
}