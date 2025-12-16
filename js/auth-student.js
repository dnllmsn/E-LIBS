/* --- PTC Library System --- */
/* --- Student Authentication Logic --- */

document.addEventListener('DOMContentLoaded', () => {


    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@paterostechnologicalcollege\.edu\.ph$/;

    // --- REGISTRATION LOGIC ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const studentId = document.getElementById('regStudentId').value.trim(); // Get student ID
        const email = document.getElementById('regEmailInput').value.trim();
        const studentName = document.getElementById('regStudentName').value.trim();
        const section = document.getElementById('regSection').value.trim();
        const password = document.getElementById('regPassword').value;

        if (!studentId || !email || !studentName || !section || !password) { // Validate student ID
            return showToast('Please fill out all fields.', 'error');
        }

        if (!emailRegex.test(email)) {
            return showToast('Invalid email format. Must be @paterostechnologicalcollege.edu.ph', 'error');
        }

        const students = window.appData.getStudents();
        if (students.some(s => s.email === email)) {
            return showToast('A student with this email is already registered.', 'error');
        }
        if (students.some(s => s.studentId === studentId)) { // Check for unique student ID
            return showToast('A student with this ID is already registered.', 'error');
        }

        const newStudent = {
            id: studentId, // Add id property for consistent user identification
            studentId: studentId, // Add student ID to the new student object
            email: email,
            name: studentName,
            section: section,
            password: password, // In a real app, this should be hashed.
            role: 'student'
        };

        students.push(newStudent);
        window.appData.saveStudents(students);

        showToast('Registration successful! You can now log in.', 'success');
        registerForm.reset();
    });

    // --- LOGIN LOGIC ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim(); // Use email for login
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            return showToast('Please enter both email and password.', 'error');
        }

        const students = window.appData.getStudents();
        const student = students.find(s => s.email === email); // Find student by email

        if (student && student.password === password) {
            showToast('Login successful!', 'success');
            window.appData.setCurrentUser(student);
            setTimeout(() => {
                window.location.href = 'student.html';
            }, 1000); // Wait a moment for the toast to be seen
        } else {
            showToast('Invalid email or password.', 'error');
        }
    });
});
