
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, GoogleIcon, FacebookIcon, UserIcon, HomeIcon } from '../components/icons';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (isSignUp) {
        // Registration Flow
        if (name.trim().length < 2) {
             throw new Error("Name must be at least 2 characters.");
        }
        await register(normalizedEmail, password, name);
        // Registration successful, standard flow redirects or logs in
      } else {
        // Login Flow
        try {
            await login(normalizedEmail, password);
        } catch (err: any) {
             // SELF-HEALING LOGIC for Demo Users
             // If the user is one of our demo users but doesn't exist in the database,
             // we automatically create the account for them.
            if ((err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') && 
                (normalizedEmail.includes('@society.com'))) {
                console.log("Attempting to auto-create demo user...");
                try {
                    const demoName = normalizedEmail.includes('admin') ? 'Society Admin' : 'Resident User';
                    await register(normalizedEmail, password, demoName);
                    return;
                } catch (regErr: any) {
                    if (regErr.code === 'auth/email-already-in-use') {
                         throw new Error("This demo email is taken by another user with a different password. Please try a different email or sign up.");
                    }
                    throw regErr;
                }
            }
            throw err; // Re-throw if not caught by self-healing
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/wrong-password') {
          setError('Incorrect password. If this is a demo account, someone else might have changed it.');
      } else if (err.code === 'auth/email-already-in-use') {
          setError('Email is already registered. Please Login.');
      } else if (err.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/too-many-requests') {
          setError('Too many failed attempts. Please try again later.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          // This specific error can sometimes indicate an API Key issue if occurring during a valid register/login attempt
          setError('Invalid email or password.');
      } else if (err.message && err.message.includes('auth/invalid-credential')) {
           setError('Configuration Error: The Firebase API Key may be invalid or expired.');
      } else {
          setError(err.message || 'Authentication failed. Please check credentials.');
      }
    }
    setLoading(false);
  };

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 font-sans">
        
      {/* Container */}
      <div className="bg-card rounded-[30px] shadow-lg border border-border p-10 w-full max-w-[450px] relative overflow-hidden">
        
        {/* Auth Form */}
        <div className="animate-fadeIn">
            
            {/* BRANDING HEADER */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <HomeIcon className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-white">MADHAV HOMES</h1>
                </div>
                <p className="text-gray-400">Sign in to manage your society</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded text-sm text-center">{error}</div>}

                {isSignUp && (
                    <div className="relative mb-4 animate-fadeIn">
                        <UserIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input 
                            type="text" 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full bg-gray-700 text-white px-4 py-3 pl-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-transparent peer transition-all" 
                            placeholder="Full Name" 
                            required={isSignUp}
                        />
                        <label 
                            htmlFor="name" 
                            className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-card peer-focus:px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base cursor-text"
                        >
                            Full Name
                        </label>
                    </div>
                )}

                <div className="relative mb-4">
                    <MailIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input 
                        type="email" 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full bg-gray-700 text-white px-4 py-3 pl-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-transparent peer transition-all" 
                        placeholder="Email" 
                        required 
                    />
                    <label 
                        htmlFor="email" 
                        className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-card peer-focus:px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base cursor-text"
                    >
                        Email
                    </label>
                </div>

                <div className="relative mb-4">
                        <LockIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full bg-gray-700 text-white px-4 py-3 pl-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-transparent peer transition-all" 
                        placeholder="Password" 
                        required 
                    />
                    <label 
                        htmlFor="password" 
                        className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-card peer-focus:px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base cursor-text"
                    >
                        Password
                    </label>
                </div>

                {!isSignUp && (
                    <p className="text-right text-sm">
                        <a href="#" className="text-gray-400 hover:text-primary hover:underline transition-colors">Recover Password</a>
                    </p>
                )}

                <button disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white text-lg font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
            </form>
            
            <div className="text-center mt-6">
                <button 
                    onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                    className="text-primary hover:text-white hover:underline text-sm font-medium transition-colors focus:outline-none"
                >
                    {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                </button>
            </div>

            <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-gray-600 w-full absolute"></div>
                <span className="bg-card px-2 text-gray-400 text-sm relative z-10">or continue with</span>
            </div>

            <div className="flex justify-center gap-4 mb-6">
                <button className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors duration-200">
                    <GoogleIcon className="h-6 w-6 text-red-500" />
                </button>
                <button className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors duration-200">
                        <FacebookIcon className="h-6 w-6 text-blue-600" />
                </button>
            </div>
            
            {!isSignUp && (
                <div className="mt-6 text-xs text-center text-gray-500">
                    <p className="font-semibold mb-1">Demo Credentials:</p>
                    <p>admin01@society.com / 123456</p>
                    <p>resident01@society.com / 123456</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Login;
