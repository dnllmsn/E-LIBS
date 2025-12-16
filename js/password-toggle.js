document.addEventListener('DOMContentLoaded', () => {
    const togglePasswordVisibilityButtons = document.querySelectorAll('.toggle-password-visibility');

    togglePasswordVisibilityButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const passwordInput = document.getElementById(targetId);

            if (passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    button.textContent = '🙈'; // Change to hide icon
                } else {
                    passwordInput.type = 'password';
                    button.textContent = '👁️'; // Change to show icon
                }
            }
        });
    });
});