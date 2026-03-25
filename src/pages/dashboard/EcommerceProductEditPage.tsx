import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { paramCase } from 'change-case';
import { useParams } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import product, { getProduct, getProducts } from '../../redux/slices/product';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
// sections
import ProductNewEditForm from '../../sections/@dashboard/e-commerce/ProductNewEditForm';

// ----------------------------------------------------------------------

export default function EcommerceProductEditPage() {
  const { themeStretch } = useSettingsContext();

  const dispatch = useDispatch();

  const { id } = useParams();

  const { product, isLoading, checkout } = useSelector((state) => state.product);

  useEffect(() => {
    if (id) {
      dispatch(getProduct(id as string));
    }
  }, [dispatch, id]);

  return (
    <>
      <Helmet>
        <title> Ecommerce: Edit product </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit product"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            {
              name: 'E-Commerce',
              href: PATH_DASHBOARD.eCommerce.root,
            },
            { name: product?.name },
          ]}
        />

        <ProductNewEditForm isEdit currentProduct={product || undefined} />
      </Container>
    </>
  );
}
