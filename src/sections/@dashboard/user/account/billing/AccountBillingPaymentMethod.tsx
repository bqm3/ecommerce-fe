import { useState, useEffect } from 'react';
// @mui
import { Card, Stack, Paper, Button, Typography, IconButton, MenuItem } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../../../../redux/store';
import { getCards, deleteCard } from '../../../../../redux/slices/card';
// components
import Image from '../../../../../components/image';
import Iconify from '../../../../../components/iconify';
import MenuPopover from '../../../../../components/menu-popover';
// section
import { PaymentNewCardDialog } from '../../../../payment';

// ----------------------------------------------------------------------

export default function AccountBillingPaymentMethod() {
  const dispatch = useDispatch();

  const { cards } = useSelector((state) => state.card);

  const [open, setOpen] = useState(false);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getCards());
  }, [dispatch]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>, cardId: string) => {
    setOpenPopover(event.currentTarget);
    setSelectedCardId(cardId);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
    setSelectedCardId(null);
  };

  const handleDelete = async () => {
    if (selectedCardId) {
      await dispatch(deleteCard(selectedCardId));
      handleClosePopover();
    }
  };

  return (
    <>
      <Card sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
          <Typography
            variant="overline"
            sx={{
              flexGrow: 1,
              color: 'text.secondary',
            }}
          >
            Payment Method
          </Typography>

          <Button size="small" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpen}>
            New card
          </Button>
        </Stack>

        <Stack
          spacing={2}
          direction={{
            xs: 'column',
            md: 'row',
          }}
        >
          {cards && cards.length > 0 && cards?.map((card) => (
            <Paper
              key={card.id}
              variant="outlined"
              sx={{
                p: 3,
                width: 1,
                position: 'relative',
              }}
            >
              <Image
                alt="icon"
                src={
                  card.cardType === 'master_card'
                    ? '/assets/icons/payments/ic_mastercard.svg'
                    : '/assets/icons/payments/ic_visa.svg'
                }
                sx={{ mb: 1, maxWidth: 36 }}
              />

              <Typography variant="subtitle2">{card.cardNumber}</Typography>

              <IconButton
                sx={{
                  top: 8,
                  right: 8,
                  position: 'absolute',
                }}
                onClick={(e) => handleOpenPopover(e, card.id)}
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      </Card>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            handleDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem>
      </MenuPopover>

      <PaymentNewCardDialog open={open} onClose={handleClose} />
    </>
  );
}
