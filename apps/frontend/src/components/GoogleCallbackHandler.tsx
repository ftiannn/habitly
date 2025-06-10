import { useAuth } from "@/lib/hooks/use-auth";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GoogleCallbackHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { googleLogin } = useAuth();
  
    useEffect(() => {
      const urlParams = new URLSearchParams(location.hash.substring(1));
      const idToken = urlParams.get('id_token');
  
      if (!idToken) {
        toast.error('No ID token found from Google');
        navigate('/login');
        return;
      }
  
      const handleLogin = async () => {
        const success = await googleLogin(idToken);
        if (success) {
          toast.success('Signed in successfully!');
          navigate('/');
        } else {
          toast.error('Login failed');
          navigate('/login');
        }
      };
  
      handleLogin();
    }, [location, googleLogin, navigate]);
  
    return (
      <div className="text-center mt-20">Finalizing Google login...</div>
    );
  };
  
  export default GoogleCallbackHandler;