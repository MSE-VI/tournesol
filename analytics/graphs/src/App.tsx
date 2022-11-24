import React from 'react';
import './App.css';
import {
    Box, Card, CardContent,
    Container,
    createTheme,
    CssBaseline,
    Divider,
    Drawer, Grid,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    ThemeProvider,
    Toolbar,
    Typography
} from '@mui/material';
import {
    BrowserRouter as Router,
    Route,
    Routes
} from "react-router-dom";
import { ChevronRight, Home as HomeIcon, Inbox, Mail, Menu } from '@mui/icons-material';
import Home from './pages/Home';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

const drawerWidth = 240;

const Main = styled('main', {shouldForwardProp: (prop) => prop !== 'open'})<{
    open?: boolean;
}>(({theme, open}) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
    }),
    marginLeft: -drawerWidth,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth,
    }),
}));

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
}));

function App() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const theme = createTheme({
        palette: {
            primary: {
                main: '#fec802'
            },
            secondary: {
                main: '#1382b2'
            }
        },
    });

    const handleDrawerOpen = () => {
        setDrawerOpen(!drawerOpen);
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{display: 'flex'}}>
                <CssBaseline/>
                <AppBar position="fixed">
                    <Toolbar>
                        <Container maxWidth="lg">
                            <Typography variant="h6" noWrap sx={{flexGrow: 1}}/>
                        </Container>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={handleDrawerOpen}
                            sx={{...(drawerOpen && {display: 'none'})}}
                        >
                            <Menu/>
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                        },
                    }}
                    variant="persistent"
                    anchor="left"
                    open={true}
                >
                    <DrawerHeader/>
                    <Divider/>
                    <Grid container p={1}>
                        <Grid item xs={12}>
                            <Card sx={{mb: 1}}>
                                <CardContent>Video</CardContent>
                            </Card>

                            <Card sx={{mb: 1}}>
                                <CardContent>Video</CardContent>
                            </Card>

                            <Card sx={{mb: 1}}>
                                <CardContent>Video</CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Drawer>
                <Main open={drawerOpen}>
                    <DrawerHeader/>
                    <Router>
                        <Routes>
                            <Route path={"*"} element={<Home/>}/>
                        </Routes>
                    </Router>
                </Main>
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                        },
                    }}
                    variant="persistent"
                    anchor="right"
                    open={drawerOpen}
                >
                    <DrawerHeader>
                        <IconButton onClick={handleDrawerOpen}>
                            <ChevronRight/>
                        </IconButton>
                    </DrawerHeader>
                    <Divider/>
                    <Container sx={{mt: 2}}>
                        <Typography align={'justify'}>
                            Lorem ipsum dolor sit amet, consect adipisicing elit. Accusamus adipisci alias aliquid
                        </Typography>
                    </Container>
                </Drawer>
            </Box>
        </ThemeProvider>
    );
}

export default App;
