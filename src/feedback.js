// Feedback widget: a "Give feedback" button that reveals a small form.
// `onSubmit` receives the trimmed message and may return a promise; if it
// rejects, the form stays open and shows an error so the user can retry.
export function createFeedbackWidget(container, { onSubmit }) {
  const root = document.createElement('div');
  root.className = 'feedback';
  root.innerHTML = `
    <button type="button" class="feedback-toggle" aria-expanded="false">Give feedback</button>
    <form class="feedback-form" hidden>
      <label for="feedback-message">Your feedback</label>
      <textarea id="feedback-message" name="message" rows="4" maxlength="1000"></textarea>
      <p class="feedback-error" role="alert" hidden></p>
      <button type="submit">Send</button>
      <button type="button" class="feedback-cancel">Cancel</button>
    </form>
    <p class="feedback-thanks" role="status" hidden>Thanks for your feedback!</p>
  `;

  const toggle = root.querySelector('.feedback-toggle');
  const form = root.querySelector('.feedback-form');
  const textarea = root.querySelector('textarea');
  const error = root.querySelector('.feedback-error');
  const submit = form.querySelector('button[type="submit"]');
  const thanks = root.querySelector('.feedback-thanks');

  function showError(text) {
    error.textContent = text;
    error.hidden = false;
  }

  function setOpen(open) {
    form.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      thanks.hidden = true;
      textarea.focus();
    } else {
      form.reset();
      error.hidden = true;
    }
  }

  toggle.addEventListener('click', () => setOpen(form.hidden));
  root.querySelector('.feedback-cancel').addEventListener('click', () => setOpen(false));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = textarea.value.trim();
    if (!message) {
      showError('Please enter some feedback before sending.');
      return;
    }

    error.hidden = true;
    submit.disabled = true;
    try {
      await onSubmit(message);
      setOpen(false);
      thanks.hidden = false;
    } catch {
      showError('Sorry, your feedback could not be sent. Please try again.');
    } finally {
      submit.disabled = false;
    }
  });

  container.appendChild(root);
  return root;
}
