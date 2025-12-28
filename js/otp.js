document.addEventListener("DOMContentLoaded", function () {
  const phoneStep = document.getElementById("phone-step");
  const otpStep = document.getElementById("otp-step");
  const sendOtpBtn = document.getElementById("send-otp-btn");
  const verifyOtpBtn = document.getElementById("verify-otp-btn");
  const phoneNumberInputField = document.getElementById("phone-number-input");
  const emailAddressInputField = document.getElementById("email-address-input");
  const otpInput = document.getElementById("otp-input");
  const messageDiv = document.getElementById("message");

  const otpMethodSms = document.getElementById("otp-method-sms");
  const otpMethodEmail = document.getElementById("otp-method-email");
  const phoneInputBox = document.getElementById("phone-input-box");
  const emailInputBox = document.getElementById("email-input-box");

  const urlParams = new URLSearchParams(window.location.search);
  const userType = urlParams.get("userType");
  const userId = urlParams.get("userId");

  let generatedOtp = null;

  // Function to toggle input visibility based on OTP method
  function toggleInputVisibility() {
    if (otpMethodSms.checked) {
      phoneInputBox.style.display = "block";
      emailInputBox.style.display = "none";
    } else {
      phoneInputBox.style.display = "none";
      emailInputBox.style.display = "block";
    }
  }

  // Initial call to set correct visibility
  toggleInputVisibility();

  // Add event listeners to radio buttons
  otpMethodSms.addEventListener("change", toggleInputVisibility);
  otpMethodEmail.addEventListener("change", toggleInputVisibility);

  sendOtpBtn.addEventListener("click", function () {
    let contactInfo = "";
    let method = "";

    if (otpMethodSms.checked) {
      contactInfo = phoneNumberInputField.value;
      method = "phone number";
    } else {
      contactInfo = emailAddressInputField.value;
      method = "email address";
    }

    if (contactInfo.trim() === "") {
      messageDiv.textContent = `Please enter your ${method}.`;
      return;
    }

    // Simulate sending OTP
    generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem("otp", generatedOtp);

    // For demonstration purposes, show the OTP in an alert
    alert(`Your OTP (${generatedOtp}) has been sent to your ${method}.`);

    // Update the message for the user
    otpStep.querySelector('p').textContent = `An OTP has been sent to your ${method}.`;

    phoneStep.style.display = "none";
    otpStep.style.display = "block";
    messageDiv.textContent = "";
  });

  verifyOtpBtn.addEventListener("click", function () {
    const enteredOtp = otpInput.value;
    const storedOtp = sessionStorage.getItem("otp");

    if (enteredOtp === storedOtp) {
      // Clear the session storage
      sessionStorage.removeItem("otp");

      // Redirect to the appropriate dashboard
      if (userType === "student") {
        window.location.href = "student.html";
      } else if (userType === "librarian") {
        window.location.href = "librarian.html";
      } else {
        messageDiv.textContent = "Invalid user type.";
      }
    } else {
      messageDiv.textContent = "Invalid OTP. Please try again.";
    }
  });
});
