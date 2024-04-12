const showNotification = (message, time) => {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, time || 3000);
}

const reload = async () => {

    let sessionAuth = document.cookie.replace(/(?:(?:^|.*;\s*)sessionAuth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    showNotification("Reloading data. This might take some time ...", 7000);

    const response = await fetch('/api/admin/reload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': sessionAuth
        }
    });

    if (response.ok) {
        showNotification("Reloaded successfully!", 7000);
    } else {
        showNotification("Failed to reload!", 7000);
    }
};

const deleteData = async () => {

    const empId = document.getElementById("delete-id").value;
    let sessionAuth = document.cookie.replace(/(?:(?:^|.*;\s*)sessionAuth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    if (!confirm("Are you sure you want to delete data for employee with ID: " + empId + "?")) return;

    showNotification("Your data deletion request has been sent ...", 7000);

    const response = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': sessionAuth
        },
        body: JSON.stringify({ empId: empId })
    });

    if (response.ok) {
        showNotification("Deleted successfully!", 7000);
    } else {
        showNotification("Failed to delete!", 7000);
    }
};