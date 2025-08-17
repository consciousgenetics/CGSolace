import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { areCookiesAccepted } from '@lib/util/cookie-consent';

const AgeVerification: React.FC = () => {
  const [birthday, setBirthday] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Only check for age verification cookie if cookies are accepted
    if (areCookiesAccepted()) {
      const verified = Cookies.get('age_verified');
      if (verified) {
        setIsVerified(true);
      }
    }
  }, []);

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = () => {
    const age = calculateAge(birthday);
    if (age >= 21) {
      setIsVerified(true);
      // Only set cookie if user has accepted cookies and wants to be remembered
      if (rememberMe && areCookiesAccepted()) {
        Cookies.set('age_verified', 'true', { expires: 30 });
      }
    } else {
      alert('You must be at least 18 years old to enter.');
    }
  };

  if (isVerified) {
    return <div>Welcome to the site!</div>;
  }

  return (
    <div>
      <h2>Age Verification</h2>
      <label>
        Enter your birthday:
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={!areCookiesAccepted()}
        />
        Remember me {!areCookiesAccepted() && '(requires cookies)'}
      </label>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default AgeVerification; 