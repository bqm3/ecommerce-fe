import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
// @mui
import {
  Card,
  Table,
  Button,
  Container,
  TableBody,
  TableContainer,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getCards, deleteCard, initializeCards } from '../../redux/slices/card';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../components/table';
// sections
import { CardTableRow } from '../../sections/@dashboard/card/list';
import { PaymentNewCardDialog } from '../../sections/payment';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name on Card', align: 'left' },
  { id: 'cardNumber', label: 'Card Number', align: 'left' },
  { id: 'expiry', label: 'Expiry (MM/YY)', align: 'left' },
  { id: 'cvv', label: 'CVV', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function CardListPage() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable();

  const { themeStretch } = useSettingsContext();

  const dispatch = useDispatch();

  const { cards, isLoading, pagination } = useSelector((state) => state.card);

  const [openNewCard, setOpenNewCard] = useState(false);

  useEffect(() => {
    dispatch(initializeCards());
    dispatch(getCards({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleOpenNewCard = () => {
    setOpenNewCard(true);
  };

  const handleCloseNewCard = () => {
    setOpenNewCard(false);
  };

  const handleDeleteRow = (id: string) => {
    dispatch(deleteCard(id));
  };

  return (
    <>
      <Helmet>
        <title> Card: List </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Card List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Card', href: PATH_DASHBOARD.card.root },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleOpenNewCard}
            >
              New Card
            </Button>
          }
        />

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={onSort}
                />

                <TableBody>
                  {cards.map((row) => (
                    <CardTableRow
                      key={row.id}
                      row={row}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))}

                  <TableNoData isNotFound={!isLoading && !cards.length} />
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

      <PaymentNewCardDialog open={openNewCard} onClose={handleCloseNewCard} />
    </>
  );
}
