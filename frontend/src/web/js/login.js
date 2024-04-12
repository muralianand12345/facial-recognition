const showNotification = (message, time) => {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, time || 3000);
}

const Login = async () => {
    const empId = document.getElementById('empId').value;
    const password = document.getElementById('password').value;

    if (!empId || !password) {
        return showNotification('Please fill all the fields');
    }

    showNotification('Logging in...', 3000);
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                empId,
                password
            })
        });

        if (response.ok) {
            const data = await response.json();
            document.cookie = `sessionAuth=${data.sessionAuth};`;
            window.location.href = '/admin';
        } else {
            showNotification('Invalid credentials');
        }

    } catch (err) {
        console.error(err);
        showNotification('An error occured. Please try again later');
    }
}