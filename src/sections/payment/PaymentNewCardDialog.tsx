import { useState } from 'react';
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
import { addCard } from '../../redux/slices/card';
// components
import Iconify from '../../components/iconify';
import MenuPopover from '../../components/menu-popover';
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField } from '../../components/hook-form';
//
import PaymentVerificationDialog from './PaymentVerificationDialog';

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

  const NewCardSchema = Yup.object().shape({
    name: Yup.string().required('Name on card is required'),
    cardNumber: Yup.string().required('Card number is required'),
    expiry: Yup.string().required('Expiry date is required'),
    cvv: Yup.string().required('CVV is required'),
  });

  const defaultValues = {
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  };

  const methods = useForm({
    resolver: yupResolver(step === 0 ? NewCardSchema : Yup.object().shape({
      code: Yup.string().required('Verification code is required'),
    })),
    defaultValues: {
      ...defaultValues,
      code: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: any) => {
    try {
      if (step === 0) {
        await dispatch(addCard({
          ...data,
          cardType: data.cardNumber.startsWith('4') ? 'visa' : 'master_card',
        }));
        setStep(1);
      } else {
        // Verification step
        if (data.code === '123456') {
          enqueueSnackbar('Verification successful!');
          handleVerify();
        } else {
          enqueueSnackbar('Invalid code! Try 123456', { variant: 'error' });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerify = () => {
    setStep(0);
    reset();
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <Dialog maxWidth="xs" fullWidth onClose={onClose} {...other}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{step === 0 ? 'Add new card' : 'Verification Required'}</DialogTitle>

          <DialogContent sx={{ overflow: 'unset' }}>
            {step === 0 ? (
              <Stack spacing={3} sx={{ pt: 1 }}>
                <RHFTextField name="name" label="Name on card" />

                <RHFTextField name="cardNumber" label="Card number" />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFTextField name="expiry" label="MM/YY" />

                  <RHFTextField
                    name="cvv"
                    label="CVV"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" edge="end" onClick={handleOpenPopover}>
                            <Iconify icon="eva:info-fill" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={3} sx={{ pt: 1 }}>
                <RHFTextField name="code" label="Verification Code (OTP)" placeholder="Try 123456" />
              </Stack>
            )}
          </DialogContent>

          <DialogActions>
            <Button color="inherit" variant="outlined" onClick={onClose}>
              Cancel
            </Button>

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
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
