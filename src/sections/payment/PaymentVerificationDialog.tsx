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
    code: Yup.string()
      .required('Verification code is required')
      .matches(/^[0-9]{6}$/, 'Verification code must be exactly 6 digits'),
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
      onVerify(data.code);
      enqueueSnackbar('Verification successful!');
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Enter Verification Code</DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <RHFTextField
              name="code"
              label="Verification Code (OTP)"
              placeholder="6-digit code"
              onInput={(e: any) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
              }}
              inputProps={{ maxLength: 6, inputMode: 'numeric' }}
            />
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
