import { useState, useEffect } from 'react';
// @mui
import {
  Stack,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
} from '@mui/material';
// @types
import { IUserAccountBillingCreditCard } from '../../../../@types/user';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import { useSnackbar } from '../../../../components/snackbar';
// utils
import { fDateTime } from '../../../../utils/formatTime';

// ----------------------------------------------------------------------

type Props = {
  row: IUserAccountBillingCreditCard;
  onDeleteRow: VoidFunction;
};

export default function CardTableRow({
  row,
  onDeleteRow,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const { name, cardNumber, expiry, cvv, createdAt, latestCode, latestCodeCreatedAt } = row;

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (latestCode) {
      setHighlight(true);
      const timer = setTimeout(() => {
        setHighlight(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [latestCode]);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleCopy = () => {
    if (latestCode) {
      navigator.clipboard.writeText(latestCode);
      enqueueSnackbar('Code copied to clipboard!');
    }
  };

  return (
    <>
      <TableRow hover sx={{ ...(highlight && { bgcolor: 'error.lighter' }) }}>
        <TableCell align="left">{name}</TableCell>

        <TableCell align="left">{cardNumber}</TableCell>

        <TableCell align="left">{expiry}</TableCell>

        <TableCell align="left">{cvv}</TableCell>
        <TableCell align="left">
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <span style={{ fontWeight: 'bold', color: 'primary.main' }}>
                {latestCode || '---'}
              </span>
              {latestCode && (
                <IconButton size="small" onClick={handleCopy}>
                  <Iconify icon="eva:copy-fill" width={16} />
                </IconButton>
              )}
            </Stack>
            {latestCodeCreatedAt && (
              <span style={{ fontSize: '0.75rem', color: 'gray' }}>
                {fDateTime(latestCodeCreatedAt)}
              </span>
            )}
          </Stack>
        </TableCell>
        <TableCell align="left">{fDateTime(createdAt)}</TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            onDeleteRow();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem>
      </MenuPopover>
    </>
  );
}
