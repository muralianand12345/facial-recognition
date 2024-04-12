const webCamElement = document.getElementById("webCam");
const overlayCanvas = document.getElementById("overlayCanvas");
const webcam = new Webcam(webCamElement, 'user', overlayCanvas);
webcam.start();

const showNotification = (message, time) => {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, time || 3000);
}

const sendImageChunk = async () => {
    let picture = await webcam.snap();

    fetch('http://localhost:5000/video', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: picture
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                if (data.message.includes("unknown")) {
                    showNotification("Seems like you are not registered. Please register first!", 3000);
                } else if (data.message.includes("No face")) {
                    showNotification("No face detected. Please try again!", 3000);
                } else {
                    showNotification(`${data.message}`, 3000);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

setInterval(sendImageChunk, 1000);

//Face Emotion

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(() => {

    overlayCanvas.height = webCamElement.offsetHeight;
    overlayCanvas.width = webCamElement.offsetWidth;

    webCamElement.addEventListener('play', () => {
        const displaySize = { width: webCamElement.offsetWidth, height: webCamElement.offsetHeight };
        faceapi.matchDimensions(overlayCanvas, displaySize)
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(webCamElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            overlayCanvas.getContext('2d').clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
            overlayCanvas.getContext('2d').save();
            overlayCanvas.getContext('2d').scale(-1, 1);
            overlayCanvas.getContext('2d').translate(-overlayCanvas.width, 0);
            faceapi.draw.drawDetections(overlayCanvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(overlayCanvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(overlayCanvas, resizedDetections);
            overlayCanvas.getContext('2d').restore();
        }, 100)
    });
})


