import { useState } from 'react';
// @mui
import {
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

// ----------------------------------------------------------------------

type Props = {
  row: IUserAccountBillingCreditCard;
  onDeleteRow: VoidFunction;
};

export default function CardTableRow({
  row,
  onDeleteRow,
}: Props) {
  const { name, cardNumber, expiry, cvv } = row;

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <TableRow hover>
        <TableCell align="left">{name}</TableCell>

        <TableCell align="left">{cardNumber}</TableCell>

        <TableCell align="left">{expiry}</TableCell>

        <TableCell align="left">{cvv}</TableCell>

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
