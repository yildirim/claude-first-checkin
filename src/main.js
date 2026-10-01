import { createFeedbackWidget } from './feedback.js';

// There is no backend yet, so submitted feedback is only logged to the console.
createFeedbackWidget(document.getElementById('app'), {
  onSubmit: (message) => console.info('Feedback submitted:', message),
});
