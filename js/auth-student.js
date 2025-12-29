/* --- PTC Library System --- */
/* --- Student Authentication Logic --- */

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const emailRegex = /^[a-zA-Z0-9._%+-]+@paterostechnologicalcollege\.edu\.ph$/;

  // --- LOGIN LOGIC ---
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      return showToast('Please enter both email and password.', 'error');
    }

    const students = window.appData.getStudents();
    const student = students.find((s) => s.email === email);

    if (student && student.password === password) {
      showToast('Login successful! Please verify OTP.', 'success');
      window.appData.setCurrentUser(student);
      
      // Redirect to OTP verification page
      window.location.href = `otp-verification.html?userType=student&userId=${student.id}`;

    } else {
      showToast('Invalid email or password.', 'error');
    }
  });
});

