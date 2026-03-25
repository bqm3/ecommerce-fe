import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
import axios from '../../utils/axios';
// @types
import { IInvoice } from '../../@types/invoice';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import InvoiceDetails from '../../sections/@dashboard/invoice/details';

// ----------------------------------------------------------------------

export default function InvoiceDetailsPage() {
  const { themeStretch } = useSettingsContext();
  const { id } = useParams();

  const [currentInvoice, setCurrentInvoice] = useState<IInvoice | undefined>(undefined);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!id) return;
        const res = await axios.get(`/api/checkout/orders/${id}`);
        const o = res.data;
        
        const mappedInvoice: IInvoice = {
          id: o.id,
          sent: 1,
          status: o.status === 'PAID' ? 'paid' : o.status === 'PENDING' ? 'unpaid' : 'draft',
          totalPrice: o.total,
          invoiceNumber: `INV-${o.id.substring(0, 5).toUpperCase()}`,
          subTotalPrice: o.subtotal,
          taxes: 0,
          discount: o.discount || 0,
          shipping: o.shipping || 0,
          invoiceFrom: {
            id: 'brand',
            name: 'E-commerce Store',
            address: '123 E-com st, CA',
            company: 'Ecommerce App',
            email: 'admin@store.com',
            phone: '123-456-7890',
          },
          invoiceTo: o.billing ? {
            id: o.id,
            name: o.billing.receiver || 'Customer',
            address: o.billing.fullAddress || '',
            company: '',
            email: o.billing.email || '',
            phone: o.billing.phoneNumber || '',
          } : {
            id: o.id,
            name: 'Guest Customer',
            address: '',
            company: '',
            email: '',
            phone: '',
          },
          createDate: new Date(o.createdAt),
          dueDate: new Date(o.createdAt),
          items: o.items.map((i: any) => ({
            id: i.id,
            title: `${i.name}`,
            description: '',
            quantity: i.quantity,
            price: i.price,
            total: i.subtotal,
            service: 'all',
          })),
        };
        
        setCurrentInvoice(mappedInvoice);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInvoice();
  }, [id]);

  return (
    <>
      <Helmet>
        <title> Invoice: View </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Invoice Details"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            {
              name: 'Invoices',
              href: PATH_DASHBOARD.invoice.root,
            },
            { name: `INV-${currentInvoice?.invoiceNumber}` },
          ]}
        />

        <InvoiceDetails invoice={currentInvoice} />
      </Container>
    </>
  );
}
