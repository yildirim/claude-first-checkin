import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFeedbackWidget } from '../src/feedback.js';

function setup(onSubmit = vi.fn()) {
  document.body.innerHTML = '<div id="app"></div>';
  const root = createFeedbackWidget(document.getElementById('app'), { onSubmit });
  return {
    onSubmit,
    toggle: root.querySelector('.feedback-toggle'),
    form: root.querySelector('.feedback-form'),
    textarea: root.querySelector('textarea'),
    error: root.querySelector('.feedback-error'),
    cancel: root.querySelector('.feedback-cancel'),
    thanks: root.querySelector('.feedback-thanks'),
  };
}

function submit(form) {
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  // Let the async submit handler settle.
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('feedback widget', () => {
  let ui;
  beforeEach(() => {
    ui = setup();
  });

  it('renders a "Give feedback" button with the form hidden', () => {
    expect(ui.toggle.textContent).toBe('Give feedback');
    expect(ui.form.hidden).toBe(true);
    expect(ui.toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the form and focuses the textarea when the button is clicked', () => {
    ui.toggle.click();
    expect(ui.form.hidden).toBe(false);
    expect(ui.toggle.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(ui.textarea);
  });

  it('closes and clears the form on cancel', () => {
    ui.toggle.click();
    ui.textarea.value = 'draft';
    ui.cancel.click();
    expect(ui.form.hidden).toBe(true);
    expect(ui.textarea.value).toBe('');
  });

  it('shows an error and does not submit empty feedback', async () => {
    ui.toggle.click();
    ui.textarea.value = '   ';
    await submit(ui.form);
    expect(ui.onSubmit).not.toHaveBeenCalled();
    expect(ui.error.hidden).toBe(false);
    expect(ui.error.textContent).toMatch(/enter some feedback/i);
  });

  it('submits trimmed feedback, closes the form and thanks the user', async () => {
    ui.toggle.click();
    ui.textarea.value = '  Great app!  ';
    await submit(ui.form);
    expect(ui.onSubmit).toHaveBeenCalledWith('Great app!');
    expect(ui.form.hidden).toBe(true);
    expect(ui.thanks.hidden).toBe(false);
  });

  it('keeps the form open with an error when sending fails', async () => {
    ui = setup(vi.fn().mockRejectedValue(new Error('network')));
    ui.toggle.click();
    ui.textarea.value = 'Hello';
    await submit(ui.form);
    expect(ui.form.hidden).toBe(false);
    expect(ui.textarea.value).toBe('Hello');
    expect(ui.error.textContent).toMatch(/could not be sent/i);
    expect(ui.thanks.hidden).toBe(true);
  });
});
