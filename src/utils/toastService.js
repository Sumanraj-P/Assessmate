import { Notyf } from 'notyf';
import 'notyf/notyf.min.css'; // Import the styles

// Configure Notyf
const notyf = new Notyf({
  duration: 3000, // Notification lasts for 3 seconds
  position: {
    x: 'right',
    y: 'top',
  },
  dismissible: true, // Allow users to dismiss notifications
  types: [
    {
      type: 'success',
      background: '#38a169', // Green color
      icon: {
        className: 'notyf__icon--success',
        tagName: 'i',
      }
    },
    {
      type: 'error',
      background: '#e53e3e', // Red color
      icon: {
        className: 'notyf__icon--error',
        tagName: 'i',
      }
    },
    {
      type: 'warning',
      background: '#ecc94b', // Yellow color
      icon: {
        className: 'notyf__icon--warning',
        tagName: 'i',
      }
    },
    {
      type: 'info',
      background: '#3182ce', // Blue color
      icon: {
        className: 'notyf__icon--info',
        tagName: 'i',
      }
    }
  ]
});

// Toast service
const toastService = {
  success(message) {
    notyf.success(message);
  },
  
  error(message) {
    notyf.error(message);
  },
  
  warning(message) {
    notyf.open({
      type: 'warning',
      message
    });
  },
  
  info(message) {
    notyf.open({
      type: 'info',
      message
    });
  }
};

export default toastService;
