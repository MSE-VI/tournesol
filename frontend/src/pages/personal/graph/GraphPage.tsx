import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Container, Input } from '@mui/material';
import { ContentHeader } from 'src/components';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { Fullscreen } from '@mui/icons-material';
import Board from 'src/components/Board/Board';
import { getUserComparisons } from '../../../utils/api/comparisons';
import { useCurrentPoll } from '../../../hooks';

const GraphPage = () => {
  const { t } = useTranslation();
  const handle = useFullScreenHandle();
  const { name: pollName } = useCurrentPoll();

  const [list] = React.useState({
    nodes: [
      { type: 'entry', id: '1', next: ['2'], data: { label: 'Input' } },
      { type: 'end', id: '2', next: [], data: { label: 'Output' } },
    ],
  });

  React.useEffect(() => {
    getUserComparisons(pollName, 1000).then((res) => {
      console.log(res);
    });
  }, [pollName]);

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
            <Board nodesList={list} />
          </Box>
        </FullScreen>
      </Container>
    </>
  );
};

export default GraphPage;
