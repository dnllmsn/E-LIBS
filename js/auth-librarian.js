/* --- PTC Library System --- */
/* --- Librarian Authentication Logic --- */

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    const currentUser = window.appData.getCurrentUser();
    if (currentUser && currentUser.role === 'librarian') {
        window.location.href = 'librarian.html';
    }

    const loginForm = document.getElementById('loginForm');

    // --- OTP Modal Elements ---
    const otpModal = document.getElementById('otp-modal');
    const closeBtn = document.querySelector('.close-btn');
    const phoneStep = document.getElementById('phone-step');
    const otpStep = document.getElementById('otp-step');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const phoneNumberInput = document.getElementById('phone-number');
    const otpInput = document.getElementById('otp-input');
    const messageDiv = document.getElementById('message');

    let generatedOtp = null;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            return showToast('Please enter both email and password.', 'error');
        }

        const librarians = window.appData.getLibrarians();
        const librarian = librarians.find(lib => lib.email === email);

        if (librarian && librarian.password === password) {
            showToast('Login successful! Please verify OTP.', 'success');
            // Add role to the user object before saving to session
            const user = { ...librarian, role: 'librarian' };
            window.appData.setCurrentUser(user);
            
            // Show the OTP modal instead of redirecting
            otpModal.style.display = 'flex';
        } else {
            showToast('Invalid email or password.', 'error');
        }
    });

    // --- OTP MODAL LOGIC ---
    closeBtn.addEventListener('click', () => {
        otpModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == otpModal) {
            otpModal.style.display = 'none';
        }
    });

    sendOtpBtn.addEventListener('click', function () {
        const phoneNumber = phoneNumberInput.value;
        if (phoneNumber.trim() === '') {
            messageDiv.textContent = 'Please enter a phone number.';
            return;
        }

        // Simulate sending OTP
        generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // For demonstration purposes, show the OTP in an alert
        alert(`Your OTP is: ${generatedOtp}`);

        phoneStep.style.display = 'none';
        otpStep.style.display = 'block';
        messageDiv.textContent = '';
    });

    verifyOtpBtn.addEventListener('click', function () {
        const enteredOtp = otpInput.value;

        if (enteredOtp === generatedOtp) {
            // Redirect to the appropriate dashboard
            showToast('OTP verification successful!', 'success');
            setTimeout(() => {
                window.location.href = 'librarian.html';
            }, 1000);
        } else {
            messageDiv.textContent = 'Invalid OTP. Please try again.';
        }
    });
});
