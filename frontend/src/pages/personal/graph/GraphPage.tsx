import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Container } from '@mui/material';
import { ContentHeader } from 'src/components';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { Fullscreen } from '@mui/icons-material';
import Board from 'src/components/Board/Board';

const GraphPage = () => {
  const { t } = useTranslation();
  const handle = useFullScreenHandle();

  return (
    <>
      <ContentHeader title={t('myGraphPage.title')} />
      <Container sx={{ py: 2 }}>
        <Button
          sx={{ mb: 2 }}
          variant={'outlined'}
          color={'secondary'}
          onClick={handle.enter}
          startIcon={<Fullscreen />}
        >
          Go Fullscreen
        </Button>

        <FullScreen handle={handle}>
          <Box
            sx={
              handle.active
                ? { height: '100%', width: '100%' }
                : {
                    mb: 2,
                    height: 500,
                    width: '100%',
                    border: 1,
                    borderRadius: '5px',
                    borderColor: 'secondary.main',
                  }
            }
          >
            <Board services={{}} />
          </Box>
        </FullScreen>
      </Container>
    </>
  );
};

export default GraphPage;
