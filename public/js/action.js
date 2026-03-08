document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('surveyForm');
  const submitButton = document.getElementById('submitButton');
  const statusMessage = document.getElementById('statusMessage');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      statusMessage.textContent = 'Please complete the required questions before submitting.';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    statusMessage.textContent = 'Saving your answers and preparing the analyst view.';

    try {
      const formData = new FormData(form);
      const payload = new URLSearchParams(formData);

      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Submission failed');
      }

      submitButton.textContent = 'Thank you!';
      statusMessage.textContent = 'Your survey was saved successfully. Redirecting to the analyst page.';
      window.location.href = result.redirectUrl;
    } catch (error) {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit your answers';
      statusMessage.textContent = 'Something went wrong while submitting your survey. Please try again.';
    }
  });
});
