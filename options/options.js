function save_options() {
    chrome.storage.local.set({
        user: document.querySelector("input#user").value,
        token: document.querySelector("input#token").value
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
        status.textContent = '';
        }, 750);
    });
}

document.getElementById('save').addEventListener('click',
    save_options);