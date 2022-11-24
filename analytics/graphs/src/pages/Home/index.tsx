import React from 'react';
import {
    Box,
    Button,
    Container, Typography,
} from '@mui/material';
import Board from '../../components/Board/Board';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { Fullscreen } from '@mui/icons-material';
import { useNotification } from '../../utils/useNotification';


const Home: React.FC = () => {
    const {displayNotification} = useNotification();
    const handle = useFullScreenHandle();

    return (
        <Container>
            <main>
                <Container sx={{py: 2}}>
                    <Typography variant="h5" align="justify" color="text.secondary" paragraph>
                        Tournesol Graph
                    </Typography>
                    <Button sx={{mb: 2}} variant={'outlined'} color={'secondary'} onClick={handle.enter} startIcon={<Fullscreen/>}>
                        Go Fullscreen
                    </Button>
                    <FullScreen handle={handle}>
                        <Box sx={handle.active ? {height: '100%', width: '100%'} :
                            {
                                mb: 2,
                                height: 500,
                                width: '100%',
                                border: 1,
                                borderRadius: '5px',
                                borderColor: 'secondary.main'
                            }}>
                            <Board services={{}}/>
                        </Box>
                    </FullScreen>
                </Container>
            </main>
        </Container>
    );
}

export default Home;
