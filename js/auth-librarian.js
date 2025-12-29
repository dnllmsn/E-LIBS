/* --- PTC Library System --- */
/* --- Librarian Authentication Logic --- */

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    const currentUser = window.appData.getCurrentUser();
    if (currentUser && currentUser.role === 'librarian') {
        window.location.href = 'librarian.html';
    }

    const loginForm = document.getElementById('loginForm');

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
            
            // Redirect to OTP verification page
            window.location.href = `otp-verification.html?userType=librarian&userId=${librarian.id}`;
        } else {
            showToast('Invalid email or password.', 'error');
        }
    });
});
