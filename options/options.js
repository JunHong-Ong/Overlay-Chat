function save_options() {
    var saving = chrome.storage.local.set({
        options: {
            user: document.querySelector("input#user").value,
            token: document.querySelector("input#token").value
        }
    });

    saving.then(() => {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';

        document.querySelector("div#credentials").setAttribute("stored", "");
        document.querySelector("input#token").value = "****************";

        document.querySelector("input#user").setAttribute("disabled", "");
        document.querySelector("input#token").setAttribute("disabled", "");

        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}


function clear_options() {
    chrome.storage.local.remove(["user", "token"], () => {
        document.querySelector("div#credentials").removeAttribute("stored");

        document.querySelector("input#user").value = "";
        document.querySelector("input#token").value = "";
        document.querySelector("input#user").removeAttribute("disabled");
        document.querySelector("input#token").removeAttribute("disabled");

        chrome.storage.local.remove("options");
    })
}

function restore_options() {
    var loading = chrome.storage.local.get("options")
    loading.then((response) => {
        if (JSON.stringify(response) === "{}") {
            return
        }

        var user = response["options"]["user"];
        var token = "****************";

        document.querySelector("input#user").value = user;
        document.querySelector("input#token").value = token;
        document.querySelector("input#user").setAttribute("disabled", "");
        document.querySelector("input#token").setAttribute("disabled", "");
    });
}

document.addEventListener("DOMContentLoaded",
    restore_options);

document.getElementById('save').addEventListener('click',
    save_options);

document.getElementById('clear').addEventListener('click',
    clear_options);