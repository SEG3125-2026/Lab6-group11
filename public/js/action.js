document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('surveyForm');
  const submitButton = document.getElementById('submitButton');
  const statusMessage = document.getElementById('statusMessage');
  const steps = document.querySelectorAll('.form-step');
  //const nextButtons = document.querySelectorAll('.next-btn');
  //const prevButtons = document.querySelectorAll('.prev-btn');
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const stepText = document.getElementById('stepText');

  let currentStep=0;

  function showStep(){
    steps.forEach((step, index) => {
      step.classList.toggle('active', index===currentStep);
    });
    //let percent=0;
    //if(currentStep>0){
      //percent=Math.round(((currentStep+1)/steps.length)*100);
    //}
    const percent=Math.round(((currentStep+1)/steps.length)*100);
    progressFill.style.width=percent+'%';
    stepText.textContent=`Step ${currentStep+1} of ${steps.length}`;
    progressPercent.textContent=percent+'%';
  }

  function validateCurrentStep(){
    const currentStepElement=steps[currentStep];
    const inputs=steps[currentStep].querySelectorAll('input, select, textarea');
    for(let input of inputs){
      if(!input.checkValidity()){
        input.reportValidity();
        statusMessage.textContent='Please complete the required questions before moving on.';
        return false;
      }
    }
    const likedCheckBoxes=currentStepElement.querySelectorAll('input[name="liked"]');
    if(likedCheckBoxes.length>0){
      const oneChecked=Array.from(likedCheckBoxes).some((checkbox)=> checkbox.checked);
      if(!oneChecked){
        statusMessage.textContent='Please complete the required questions before moving on.'
        return false;
      }
    }
    statusMessage.textContent='';
    return true;
  }

  document.querySelectorAll('.next-btn').forEach((button) => {
    button.addEventListener('click', ()=> {
      if(!validateCurrentStep()){
        return
      }
      if(currentStep<steps.length-1){
        currentStep++;
        showStep();
      }
    });
  });
  document.querySelectorAll('.prev-btn').forEach((button) => {
    button.addEventListener('click', ()=> {
      statusMessage.textContent= '';
      if(currentStep>0){
        currentStep--;
        showStep();
      }
    });
  });

  showStep();


  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validateCurrentStep()) {
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
