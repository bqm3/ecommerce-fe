import { useState, useMemo, useRef, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Stack,
  Button,
  Dialog,
  IconButton,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { useDispatch } from '../../redux/store';
import { addCard, saveCardCode } from '../../redux/slices/card';
// components
import Iconify from '../../components/iconify';
import MenuPopover from '../../components/menu-popover';
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
}

export default function PaymentNewCardDialog({ onSuccess, onClose, ...other }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [step, setStep] = useState(0); // 0: card input, 1: verification
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  // ✅ Dùng ref để giữ giá trị step mới nhất, tránh stale closure trong resolver
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // ─── Schemas ────────────────────────────────────────────────────────────────

  const NewCardSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required('Name on card is required'),
        cardNumber: Yup.string()
          .required('Card number is required')
          .matches(/^[0-9]{16}$/, 'Card number must be 16 digits'),
        expiry: Yup.string()
          .required('Expiry date is required')
          .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Expiry date must be in MM/YY format')
          .test('not-past', 'Expiry date cannot be in the past', (value) => {
            if (!value) return false;
            const [month, year] = value.split('/');
            const expiryDate = new Date(Number(`20${year}`), Number(month) - 1);
            const now = new Date();
            now.setDate(1);
            now.setHours(0, 0, 0, 0);
            return expiryDate >= now;
          }),
        cvv: Yup.string()
          .required('CVV is required')
          .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
        code: Yup.string(), // Không validate ở step 0
      }),
    []
  );

  const VerificationSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string(),
        cardNumber: Yup.string(),
        expiry: Yup.string(),
        cvv: Yup.string(),
        code: Yup.string()
          .required('Verification code is required')
          .matches(/^[0-9]{6}$/, 'Verification code must be 6 digits'),
      }),
    []
  );

  // ─── Form ────────────────────────────────────────────────────────────────────

  const defaultValues = useMemo(
    () => ({
      name: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      code: '',
    }),
    []
  );

  const methods = useForm({
    // ✅ Đọc stepRef.current thay vì step trực tiếp — luôn lấy giá trị mới nhất
    resolver: (values, context, options) => {
      const schema = stepRef.current === 0 ? NewCardSchema : VerificationSchema;
      return yupResolver(schema)(values, context, options);
    },
    defaultValues,
    mode: 'all',
  });


  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return; // ✅ Bỏ qua lần đầu mount
    }
    methods.trigger(); // Chỉ trigger khi step thực sự thay đổi
  }, [step, methods]);

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const onSubmit = async (data: any) => {
    // ✅ Bỏ đoạn check errors thủ công — handleSubmit đã chặn nếu có lỗi rồi
    try {
      if (step === 0) {
        await dispatch(
          addCard({
            name: data.name,
            cardNumber: data.cardNumber,
            expiry: data.expiry,
            cvv: data.cvv,
            cardType: data.cardNumber.startsWith('4') ? 'visa' : 'master_card',
          })
        );
        setStep(1);
      } else {
        // Verification step
        await dispatch(saveCardCode({ cardNumber: data.cardNumber, code: data.code }));
        enqueueSnackbar('Verification successful!');
        handleVerifySuccess();
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(
        typeof error === 'string' ? error : error?.message || 'An error occurred',
        { variant: 'error' }
      );
    }
  };

  const handleVerifySuccess = () => {
    setStep(0);
    reset();
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleCancel = () => {
    // ✅ Reset cả step lẫn form khi người dùng bấm Cancel
    setStep(0);
    reset();
    onClose();
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog maxWidth="xs" fullWidth onClose={handleCancel} {...other}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {step === 0 ? 'Add new card' : 'Verification Required'}
          </DialogTitle>

          <DialogContent sx={{ overflow: 'unset' }}>
            {step === 0 ? (
              <Stack spacing={3} sx={{ pt: 1 }}>
                <RHFTextField name="name" label="Name on card" />

                <RHFTextField
                  name="cardNumber"
                  label="Card number"
                  onInput={(e: any) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  }}
                  inputProps={{ maxLength: 16, inputMode: 'numeric' }}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFTextField
                    name="expiry"
                    label="MM/YY"
                    placeholder="MM/YY"
                    onInput={(e: any) => {
                      let value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length > 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      e.target.value = value;
                    }}
                    inputProps={{ maxLength: 5, inputMode: 'numeric' }}
                  />

                  <RHFTextField
                    name="cvv"
                    label="CVV"
                    onInput={(e: any) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" edge="end" onClick={handleOpenPopover}>
                            <Iconify icon="eva:info-fill" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      maxLength: 4,
                      inputMode: 'numeric',
                    }}
                  />
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={3} sx={{ pt: 1 }}>
                <RHFTextField
                  name="code"
                  label="Verification Code (OTP)"
                  placeholder="Enter 6-digit code"
                  onInput={(e: any) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  }}
                  inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                />
              </Stack>
            )}
          </DialogContent>

          <DialogActions>
            <Button color="inherit" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>

            <LoadingButton type="submit" variant="contained" loading={isSubmitting} disabled={!isValid}>
              {step === 0 ? 'Add' : 'Verify & Pay'}
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="bottom-center"
        sx={{ maxWidth: 200, typography: 'body2', textAlign: 'center' }}
      >
        Three-digit number on the back of your VISA card
      </MenuPopover>
    </>
  );
}