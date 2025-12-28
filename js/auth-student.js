/* --- PTC Library System --- */
/* --- Student Authentication Logic --- */

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const emailRegex = /^[a-zA-Z0-9._%+-]+@paterostechnologicalcollege\.edu\.ph$/;

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

  // --- REGISTRATION LOGIC ---
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const studentId = document.getElementById('regStudentId').value.trim();
    const email = document.getElementById('regEmailInput').value.trim();
    const studentName = document.getElementById('regStudentName').value.trim();
    const section = document.getElementById('regSection').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!studentId || !email || !studentName || !section || !password) {
      return showToast('Please fill out all fields.', 'error');
    }

    if (!emailRegex.test(email)) {
      return showToast(
        'Invalid email format. Must be @paterostechnologicalcollege.edu.ph',
        'error'
      );
    }

    const students = window.appData.getStudents();
    if (students.some((s) => s.email === email)) {
      return showToast(
        'A student with this email is already registered.',
        'error'
      );
    }
    if (students.some((s) => s.studentId === studentId)) {
      return showToast('A student with this ID is already registered.', 'error');
    }

    const newStudent = {
      id: studentId,
      studentId: studentId,
      email: email,
      name: studentName,
      section: section,
      password: password, // In a real app, this should be hashed.
      role: 'student',
    };

    students.push(newStudent);
    window.appData.saveStudents(students);

    showToast('Registration successful! You can now log in.', 'success');
    registerForm.reset();
  });

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
        window.location.href = 'student.html';
      }, 1000);
    } else {
      messageDiv.textContent = 'Invalid OTP. Please try again.';
    }
  });
});

