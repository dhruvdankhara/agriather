/**
 * Load Razorpay SDK dynamically
 * @returns {Promise<boolean>} True if loaded successfully
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Display Razorpay payment modal
 * @param {Object} options - Razorpay options
 * @param {Function} onSuccess - Success callback
 * @param {Function} onFailure - Failure callback
 */
export const displayRazorpay = async (options, onSuccess, onFailure) => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert(
      'Razorpay SDK failed to load. Please check your internet connection.'
    );
    return;
  }

  const razorpayOptions = {
    ...options,
    handler: function (response) {
      onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        onFailure({
          error: {
            description: 'Payment cancelled by user',
          },
        });
      },
    },
  };

  const paymentObject = new window.Razorpay(razorpayOptions);
  paymentObject.open();
};
