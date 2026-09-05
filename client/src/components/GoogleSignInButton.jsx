import { useEffect, useRef } from 'react';

export default function GoogleSignInButton({ onCredential }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set — Google sign-in button will not render.');
      return;
    }

    let cancelled = false;

    function render() {
      if (cancelled || !window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential)
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        width: 320
      });
    }

    if (window.google) render();
    else {
      const iv = setInterval(() => {
        if (window.google) {
          clearInterval(iv);
          render();
        }
      }, 100);
      return () => { cancelled = true; clearInterval(iv); };
    }
  }, [onCredential]);

  return <div ref={buttonRef} />;
}