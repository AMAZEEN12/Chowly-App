import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/') return null;

  const goBack = () => {
    const index = window.history.state?.idx;
    if (typeof index === 'number' && index > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="back-nav container">
      <button className="back-button" onClick={goBack} type="button">
        <ArrowLeft size={17} />
        <span>Back</span>
      </button>
    </div>
  );
}
