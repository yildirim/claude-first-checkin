// Feedback widget: a "Give feedback" button that reveals a small form.
// `onSubmit` receives the trimmed message and may return a promise; if it
// rejects, the form stays open and shows an error so the user can retry.
let widgetCount = 0;

export function createFeedbackWidget(container, { onSubmit }) {
  // Unique per widget so each label points at its own textarea.
  const messageId = `feedback-message-${++widgetCount}`;
  const root = document.createElement('div');
  root.className = 'feedback';
  root.innerHTML = `
    <button type="button" class="feedback-toggle" aria-expanded="false">Give feedback</button>
    <form class="feedback-form" hidden>
      <label for="${messageId}">Your feedback</label>
      <textarea id="${messageId}" name="message" rows="4" maxlength="1000"></textarea>
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
  const cancel = root.querySelector('.feedback-cancel');
  const thanks = root.querySelector('.feedback-thanks');

  function showError(text) {
    error.textContent = text;
    error.hidden = false;
  }

  function setOpen(open) {
    form.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    error.hidden = true;
    if (open) {
      thanks.hidden = true;
      textarea.focus();
    } else {
      form.reset();
    }
  }

  toggle.addEventListener('click', () => setOpen(form.hidden));
  cancel.addEventListener('click', () => setOpen(false));

  // While a send is in flight the form can't be submitted again or closed,
  // so the result always lands on the form the message came from.
  function setSending(sending) {
    submit.disabled = sending;
    cancel.disabled = sending;
    toggle.disabled = sending;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = textarea.value.trim();
    if (!message) {
      showError('Please enter some feedback before sending.');
      return;
    }

    error.hidden = true;
    setSending(true);
    try {
      await onSubmit(message);
      setOpen(false);
      thanks.hidden = false;
    } catch {
      showError('Sorry, your feedback could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  });

  container.appendChild(root);
  return root;
}
