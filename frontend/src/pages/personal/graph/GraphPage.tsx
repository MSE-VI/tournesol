import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Drawer,
  FormControlLabel, FormGroup, FormLabel,
  Grid,
  Switch,
  Typography,
} from '@mui/material';
import { ContentHeader } from 'src/components';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { Compare, Fullscreen } from '@mui/icons-material';
import Board from 'src/components/Board/Board';
import { getUserComparisons } from '../../../utils/api/comparisons';
import { useCurrentPoll } from '../../../hooks';
import {
  PaginatedRecommendationList,
  PollsService,
  UsersService,
  VideoService,
} from '../../../services/openapi';
import { styled } from '@mui/styles';
import { useAppSelector } from '../../../app/hooks';
import {
  closeDrawer,
  selectFrameDrawerId,
  selectFrameDrawerOpen,
} from '../../../utils/reducers/drawerSlice';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import VideoCard from 'src/features/videos/VideoCard';
import EntityList from '../../../features/entities/EntityList';
import { contentHeaderHeight } from '../../../components/ContentHeader';
import { ReactFlowProvider } from 'reactflow';

const drawerWidth = 390;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  margin: theme.spacing(1, 0),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const GraphPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const handle = useFullScreenHandle();
  const { baseUrl, name: pollName } = useCurrentPoll();

  const [mixedLayout, setMixedLayout] = React.useState(true);
  const [comparisons, setComparisons] = React.useState<any[]>([]);

  const [list, setList] = React.useState<any>({
    nodes: [],
  });

  const [selectedVideo, setSelectedVideo] = React.useState<any>(null);
  const [recommendedVideo, setRecommendedVideo] = React.useState<any>(null);

  const drawerOpen = useAppSelector(selectFrameDrawerOpen);
  const drawerId = useAppSelector(selectFrameDrawerId);

  const [ready, setReady] = React.useState(false);

  const [uploaderVideos, setUploaderVideos] =
    React.useState<PaginatedRecommendationList>({ results: [], count: 0 });

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const onToggleLayout = () => {
    setMixedLayout(!mixedLayout);
  };

  const retrieveVideos = async () => {
    if (drawerId === '') {
      setUploaderVideos({ results: [], count: 0 });
    }
    const videos = await PollsService.pollsRecommendationsList({
      name: 'videos',
      limit: 25,
      unsafe: true,
      metadata: {
        uploader: drawerId,
      },
    });
    if (videos) {
      setUploaderVideos(videos);
    }
  };

  const getComparisons = async () => {
    setReady(false);
    const SIZE = 10;
    const response = await getUserComparisons(pollName, 1000);
    const randomIndex = Math.floor(Math.random() * (response.length - SIZE));
    const randomComparisons = response.slice(randomIndex, randomIndex + SIZE);
    setComparisons(response);
  };

  const constructVideoNode = (video: any, next: any[]) => {
    return {
      type: 'node',
      id: video.uid,
      next: next,
      data: { label: video.metadata.name, type: 'video' },
      stroke: 'red',
    };
  };

  const constructChannelNode = (video: any) => {
    return {
      type: 'node',
      id: video.metadata.uploader,
      next: [video.uid],
      data: { label: video.metadata.uploader, type: 'channel' },
      stroke: 'blue',
    };
  };

  const constructVideos = async () => {
    dispatch(closeDrawer());
    if (comparisons.length === 0) {
      const listWithoutDuplicatesNext = list.nodes;
      listWithoutDuplicatesNext.forEach((node: any) => {
        const nodeNext: any[] = [];
        node.next.forEach((nextNode: any) => {
          if (!nodeNext.includes(nextNode)) {
            nodeNext.push(nextNode);
          }
        });
        node.next = nodeNext;
      }, []);
      setList({ nodes: listWithoutDuplicatesNext });
      setReady(true);
      return;
    }
    setReady(false);
    const item = comparisons[0];

    const videosFromChannelA = list.nodes.filter(
      (node: any) => node.id === item.entity_a.metadata.uploader
    );
    const videosFromChannelB = list.nodes.filter(
      (node: any) => node.id === item.entity_b.metadata.uploader
    );

    const videoAExists =
      list.nodes.filter((n: any) => n.id === item.entity_a.uid).length !== 0;
    const videoBExists =
      list.nodes.filter((n: any) => n.id === item.entity_b.uid).length !== 0;

    if (videoAExists && videoBExists) {
      setList((prev: any) => {
        return {
          ...prev,
          nodes: prev.nodes.map((n: any) => {
            if (
              n.id === item.entity_a.uid &&
              !n.next.includes(item.entity_b.uid)
            ) {
              return {
                ...n,
                next: [...n.next, item.entity_b.uid],
              };
            }
            return n;
          }),
        };
      });
    } else if (videoAExists && !videoBExists) {
      setList((prev: any) => {
        let array = prev.nodes.map((n: any) => {
          if (n.id === item.entity_a.uid) {
            return {
              ...n,
              next: [...n.next, item.entity_b.uid],
            };
          }
          return n;
        });
        if (videosFromChannelB.length === 0) {
          return {
            ...prev,
            nodes: array.concat([
              constructVideoNode(item.entity_b, []),
              constructChannelNode(item.entity_b),
            ]),
          };
        }
        array = prev.nodes.map((n: any) => {
          if (n.id === item.entity_a.uid) {
            return {
              ...n,
              next: [...n.next, item.entity_b.uid],
            };
          }
          if (n.id === item.entity_b.uploader) {
            return {
              ...n,
              next: [...n.next, item.entity_b.uid],
            };
          }
          return n;
        });
        return {
          ...prev,
          nodes: array.concat([constructVideoNode(item.entity_b, [])]),
        };
      });
    } else if (!videoAExists && videoBExists) {
      setList((prev: any) => {
        let array = prev.nodes.map((n: any) => {
          if (n.id === item.entity_b.uid) {
            return {
              ...n,
              next: [...n.next, item.entity_a.uid],
            };
          }
          return n;
        });
        if (videosFromChannelA.length === 0) {
          return {
            ...prev,
            nodes: array.concat([
              constructVideoNode(item.entity_a, []),
              constructChannelNode(item.entity_a),
            ]),
          };
        }
        array = prev.nodes.map((n: any) => {
          if (n.id === item.entity_b.uid) {
            return {
              ...n,
              next: [...n.next, item.entity_a.uid],
            };
          }
          if (n.id === item.entity_a.uploader) {
            return {
              ...n,
              next: [...n.next, item.entity_a.uid],
            };
          }
          return n;
        });
        return {
          ...prev,
          nodes:
            // add to array
            array.concat([constructVideoNode(item.entity_a, [])]),
        };
      });
    } else {
      setList((prev: any) => {
        if (
          videosFromChannelA.length === 0 &&
          videosFromChannelB.length === 0
        ) {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              constructVideoNode(item.entity_a, [item.entity_b.uid]),
              constructVideoNode(item.entity_b, []),
              constructChannelNode(item.entity_a),
              constructChannelNode(item.entity_b),
            ],
          };
        } else if (videosFromChannelA.length === 0) {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              constructVideoNode(item.entity_a, [item.entity_b.uid]),
              constructVideoNode(item.entity_b, []),
              constructChannelNode(item.entity_a),
              {
                ...videosFromChannelB[0],
                next: [...videosFromChannelB[0].next, item.entity_b.uid],
              },
            ],
          };
        } else if (videosFromChannelB.length === 0) {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              constructVideoNode(item.entity_a, [item.entity_b.uid]),
              constructVideoNode(item.entity_b, []),
              {
                ...videosFromChannelA[0],
                next: [...videosFromChannelA[0].next, item.entity_a.uid],
              },
              constructChannelNode(item.entity_b),
            ],
          };
        } else {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              constructVideoNode(item.entity_a, [item.entity_b.uid]),
              constructVideoNode(item.entity_b, []),
              // add a to existing video.uploader next list
              {
                ...videosFromChannelA[0],
                next: [...videosFromChannelA[0].next, item.entity_a.uid],
              },
              // add b to existing video2.uploader next list
              {
                ...videosFromChannelB[0],
                next: [...videosFromChannelB[0].next, item.entity_b.uid],
              },
            ],
          };
        }
      });
    }
    await setComparisons(comparisons.slice(1));
    await delay(10);
  };

  React.useEffect(() => {
    getComparisons();
  }, [pollName]);

  React.useEffect(() => {
    constructVideos();
  }, [comparisons]);

  React.useEffect(() => {
    retrieveVideos();
  }, [drawerId]);

  React.useEffect(() => {
    if (selectedVideo === null) {
      return;
    }

    UsersService.usersMeEntitiesToCompareList({
      pollName: pollName,
      firstEntityUid: selectedVideo.video.uid,
      limit: 1,
    }).then((entities) => {
      if (entities.results && entities.results.length >= 1) {
        VideoService.videoRetrieve({
          videoId: entities.results[0].uid.split('yt:')[1],
        }).then((video) => {
          setRecommendedVideo(video);
        });
      }
    });
  }, [selectedVideo]);

  return (
    <>
      <ContentHeader title={t('myGraphPage.title')} />
      <Container sx={{ py: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Button
              variant={'outlined'}
              color={'secondary'}
              onClick={handle.enter}
              startIcon={<Fullscreen />}
            >
              Go Fullscreen
            </Button>
          </Grid>
          <Grid item>
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item>Round Layout</Grid>
              <Grid item>
                <Switch checked={mixedLayout} onChange={onToggleLayout} />
              </Grid>
              <Grid item>Dagre Layout</Grid>
            </Grid>
          </Grid>
        </Grid>

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
            <ReactFlowProvider>
              <Board
                nodesList={list}
                ready={ready}
                mixedLayout={mixedLayout}
                onClickHandler={(idx) => {
                  const node = list.nodes.filter((n: any) => n.id === idx)[0];
                  console.log(node);
                  VideoService.videoRetrieve({
                    videoId: node.id.split('yt:')[1],
                  }).then((video) => {
                    // Clear previous state
                    setRecommendedVideo(null);
                    if (selectedVideo) {
                      const selectedVideoInList = list.nodes.filter(
                        (n: any) => n.id === selectedVideo.nodeIdx
                      )[0];
                      selectedVideoInList.selected = false;
                    }
                    // Set new state
                    node.selected = true;
                    setSelectedVideo({
                      video: video,
                      nodeIdx: idx,
                    });
                  });
                }}
              />
            </ReactFlowProvider>
          </Box>
        </FullScreen>

        {selectedVideo && (
          <Grid container spacing={2}>
            <Grid item sx={{ mb: 2 }} xs={12} md={6}>
              <VideoCard
                video={selectedVideo.video}
                actions={[]}
                showPlayer={false}
              />
            </Grid>
            {recommendedVideo ? (
              <>
                <Grid item sx={{ mb: 2 }} xs={12} md={6}>
                  <VideoCard
                    video={recommendedVideo}
                    actions={[]}
                    showPlayer={false}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    size={'large'}
                    color="secondary"
                    variant="contained"
                    endIcon={<Compare />}
                    component={RouterLink}
                    to={`${baseUrl}/comparison?uidA=${selectedVideo.video.uid}&uidB=${recommendedVideo.uid}`}
                  >
                    {t('entityAnalysisPage.generic.compare')}
                  </Button>
                </Grid>
              </>
            ) : (
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CircularProgress />
              </Grid>
            )}
          </Grid>
        )}

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
          <DrawerHeader />
          <Box
            px={[2, 4]}
            py={2}
            color="text.secondary"
            bgcolor="background.menu"
            borderBottom="1px solid rgba(0, 0, 0, 0.12)"
            height={contentHeaderHeight}
          >
            <Grid container spacing={1}>
              <Grid item xs>
                <Typography variant={'h6'} className={'cut-text'}>
                  {drawerId}
                </Typography>
              </Grid>
              <Grid item alignItems={'end'} xs={3}>
                <Button
                  variant={'contained'}
                  onClick={() => dispatch(closeDrawer())}
                >
                  Close
                </Button>
              </Grid>
            </Grid>
            <EntityList entities={uploaderVideos.results} />
          </Box>
        </Drawer>
      </Container>
    </>
  );
};

export default GraphPage;
