function showPage(pageId) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");
}


function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showPage("twofaPage");
        } else {
            document.getElementById("loginMessage").innerText = data.message;
        }
    });
}


function verify2FA() {
    const code = document.getElementById("twofaCode").value;

    fetch("/api/verify-2fa", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code: code
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            document.getElementById("twofaMessage").innerText = data.message;
            return;
        }

        if (data.role === "ADMIN") {
            showPage("adminPage");
        } else if (data.role === "HOTEL_MANAGER") {
            showPage("managerPage");
        } else {
            showPage("customerPage");
        }
    });
}


function loadHotels() {
    fetch("/api/hotels")
    .then(response => response.json())
    .then(hotels => {
        let html = "";

        hotels.forEach(function(hotel) {
            html += `
                <div class="hotel-card">
                    <h3>${hotel.hotel_name}</h3>
                    <p><strong>City:</strong> ${hotel.city}</p>
                    <p><strong>Address:</strong> ${hotel.address}</p>
                    <p>${hotel.description}</p>
                </div>
            `;
        });

        document.getElementById("customerHotels").innerHTML = html;
        document.getElementById("managerHotels").innerHTML = html;
        document.getElementById("adminHotels").innerHTML = html;
    });
}


function logout() {
    fetch("/api/logout", {
        method: "POST"
    })
    .then(response => response.json())
    .then(data => {
        showPage("homePage");
    });
}