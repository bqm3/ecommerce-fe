import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
import axios from '../../utils/axios';
// @types
import { IUserAccountGeneral } from '../../@types/user';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import UserNewEditForm from '../../sections/@dashboard/user/UserNewEditForm';

// ----------------------------------------------------------------------

export default function UserEditPage() {
  const { themeStretch } = useSettingsContext();

  const { name: id } = useParams();

  const [currentUser, setCurrentUser] = useState<IUserAccountGeneral | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`/api/users/${id}`);
        setCurrentUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <>
      <Helmet>
        <title> User: Edit user </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit user"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'User',
              href: PATH_DASHBOARD.user.list,
            },
            { name: currentUser?.name },
          ]}
        />

        <UserNewEditForm isEdit currentUser={currentUser} />
      </Container>
    </>
  );
}
