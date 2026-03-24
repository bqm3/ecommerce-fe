import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { useSnackbar } from '../../components/snackbar';

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  onVerify: (code: string) => void;
  onClose: VoidFunction;
}

type FormValuesProps = {
  code: string;
};

export default function PaymentVerificationDialog({ onVerify, onClose, ...other }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const VerifySchema = Yup.object().shape({
    code: Yup.string().required('Verification code is required'),
  });

  const defaultValues = {
    code: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(VerifySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // Simulation of code verification
      if (data.code === '123456') {
        onVerify(data.code);
        enqueueSnackbar('Verification successful!');
        reset();
      } else {
        enqueueSnackbar('Invalid code! Try 123456', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Enter Verification Code</DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Stack spacing={3}>
            <RHFTextField name="code" label="Verification Code (OTP)" placeholder="Try 123456" />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Verify & Pay
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
