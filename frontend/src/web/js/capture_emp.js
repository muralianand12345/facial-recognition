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

const takeAPicture = async () => {
    let name = document.getElementById("name").value;
    let image = await webcam.snap();

    showLoader();

    let total_img = 10;

    for (let i = 0; i < total_img; i++) {
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

        const data = await response.json();

        if (data.status === "success") {
            await showNotification(`Image ${i + 1} captured successfully! | Status: ${data.status}`, 3000);
        } else {
            await showNotification(`Image ${i + 1} failed to capture! | Status: ${data.status}`, 3000);
            hideLoader();
            return;
        }
    }

    hideLoader();
    showNotification("Image captured successfully!", 5000);
}
