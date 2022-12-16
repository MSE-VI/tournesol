import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Divider,
  Drawer,
  Grid,
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
import { useHistory, useParams, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import VideoCard from 'src/features/videos/VideoCard';

const drawerWidth = 390;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  margin: theme.spacing(2, 0),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const GraphPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const navigateToEntityPage = (entity: string) =>
    history.push(`/entities/${entity}`);
  const { t } = useTranslation();
  const handle = useFullScreenHandle();
  const { baseUrl, name: pollName } = useCurrentPoll();

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
      stroke: 'blue',
    };
  };

  const constructChannelNode = (channelId: any, videoUid: string) => {
    return {
      type: 'node',
      id: channelId,
      next: [videoUid],
      data: { label: channelId, type: 'channel' },
      stroke: 'red',
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
    const video = await VideoService.videoRetrieve({
      videoId: item.entity_a.uid.split('yt:')[1],
    });
    const video2 = await VideoService.videoRetrieve({
      videoId: item.entity_b.uid.split('yt:')[1],
    });
    const filteredData1 = list.nodes.filter(
      (node: any) => node.id === video.uploader
    );
    const filteredData2 = list.nodes.filter(
      (node: any) => node.id === video2.uploader
    );
    if (
      list.nodes.filter((n: any) => n.id === item.entity_a.uid).length !== 0 &&
      list.nodes.filter((n: any) => n.id === item.entity_b.uid).length !== 0
    ) {
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
    } else if (
      list.nodes.filter((n: any) => n.id === item.entity_a.uid).length !== 0 &&
      list.nodes.filter((n: any) => n.id === item.entity_b.uid).length === 0
    ) {
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
        if (filteredData2.length === 0) {
          return {
            ...prev,
            nodes: array.concat([
              constructVideoNode(item.entity_b, []),
              constructChannelNode(video2.uploader, item.entity_b.uid),
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
          if (n.id === video2.uploader) {
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
    } else if (
      list.nodes.filter((n: any) => n.id === item.entity_a.uid).length === 0 &&
      list.nodes.filter((n: any) => n.id === item.entity_b.uid).length !== 0
    ) {
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
        if (filteredData1.length === 0) {
          return {
            ...prev,
            nodes: array.concat([
              constructVideoNode(item.entity_a, []),
              constructChannelNode(video.uploader, item.entity_a.uid),
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
          if (n.id === video.uploader) {
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
        if (filteredData1.length === 0 && filteredData2.length === 0) {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              constructVideoNode(item.entity_a, [item.entity_b.uid]),
              constructVideoNode(item.entity_b, []),
              constructChannelNode(video.uploader, item.entity_a.uid),
              constructChannelNode(video2.uploader, item.entity_b.uid),
            ],
          };
        } else if (filteredData1.length === 0) {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              constructVideoNode(item.entity_a, [item.entity_b.uid]),
              constructVideoNode(item.entity_b, []),
              constructChannelNode(video.uploader, item.entity_a.uid),
              {
                ...filteredData2[0],
                next: [...filteredData2[0].next, item.entity_b.uid],
              },
            ],
          };
        } else if (filteredData2.length === 0) {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              constructVideoNode(item.entity_a, [item.entity_b.uid]),
              constructVideoNode(item.entity_b, []),
              {
                ...filteredData1[0],
                next: [...filteredData1[0].next, item.entity_a.uid],
              },
              constructChannelNode(video2.uploader, item.entity_b.uid),
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
                ...filteredData1[0],
                next: [...filteredData1[0].next, item.entity_a.uid],
              },
              // add b to existing video2.uploader next list
              {
                ...filteredData2[0],
                next: [...filteredData2[0].next, item.entity_b.uid],
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
      firstEntityUid: selectedVideo.uid,
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
            <Board
              nodesList={list}
              ready={ready}
              onClickHandler={(idx) => {
                const node = list.nodes[idx];
                VideoService.videoRetrieve({
                  videoId: node.id.split('yt:')[1],
                }).then((video) => {
                  // Clear previous state
                  setRecommendedVideo(null);
                  if (selectedVideo) {
                    list.nodes[selectedVideo.nodeIdx].selected = false;
                  }

                  // Set new state
                  list.nodes[idx].selected = true;
                  setSelectedVideo({
                    video: video,
                    nodeIdx: idx,
                  });
                });
              }}
            />
          </Box>
        </FullScreen>

        {selectedVideo && (
          <>
            <VideoCard
              video={selectedVideo.video}
              actions={[]}
              showPlayer={false}
            />
            {recommendedVideo ? (
              <>
                <VideoCard
                  video={recommendedVideo}
                  actions={[]}
                  showPlayer={false}
                />
                <Button
                  color="secondary"
                  variant="contained"
                  endIcon={<Compare />}
                  component={RouterLink}
                  to={`${baseUrl}/comparison?uidA=${selectedVideo.video.uid}&uidB=${recommendedVideo.uid}`}
                >
                  {t('entityAnalysisPage.generic.compare')}
                </Button>
              </>
            ) : (
              <Typography variant={'h5'} align={'center'}>
                Loading video to compare
              </Typography>
            )}
          </>
        )}

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
            overflow: 'scroll',
          }}
          variant="persistent"
          anchor="right"
          open={drawerOpen}
        >
          <DrawerHeader />
          <Container sx={{ mt: 1 }}>
            <Typography variant={'h5'} align={'justify'}>
              {drawerId}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {uploaderVideos.results?.map((video) => (
                <Grid item xs={12} key={video?.metadata?.video_id}>
                  <Card>
                    <CardHeader title={video?.metadata?.name} />
                    <CardContent>
                      <Typography variant="body1" color="text.secondary">
                        Comparisons: {video?.n_comparisons}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Uploaded on: {video?.metadata?.publication_date}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigateToEntityPage(video?.uid)}
                        color={'secondary'}
                        variant={'outlined'}
                      >
                        View
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Drawer>
      </Container>
    </>
  );
};

export default GraphPage;
