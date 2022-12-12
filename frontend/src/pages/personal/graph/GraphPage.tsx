import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Container, Input } from '@mui/material';
import { ContentHeader } from 'src/components';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { Fullscreen } from '@mui/icons-material';
import Board from 'src/components/Board/Board';
import { getUserComparisons } from '../../../utils/api/comparisons';
import { useCurrentPoll } from '../../../hooks';
import { VideoService } from '../../../services/openapi';

const GraphPage = () => {
  const { t } = useTranslation();
  const handle = useFullScreenHandle();
  const { name: pollName } = useCurrentPoll();

  const [comparisons, setComparisons] = React.useState<any[]>([]);

  const [list, setList] = React.useState<any>({
    nodes: [],
  });

  const [ready, setReady] = React.useState(false);

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const getComparisons = async () => {
    const SIZE = 20;
    const response = await getUserComparisons(pollName, 1000);
    // get 20 comparisons from response starting randomly
    const randomIndex = Math.floor(Math.random() * (response.length - SIZE));
    const randomComparisons = response.slice(randomIndex, randomIndex + SIZE);
    setComparisons(randomComparisons);
  };

  const constructVideos = async () => {
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
    }
    else if (
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
              {
                type: 'node',
                id: item.entity_b.uid,
                next: [],
                data: {label: item.entity_b.metadata.name, type: 'video'},
                stroke: 'blue',
              },
              {
                type: 'node',
                id: video2.uploader,
                next: [item.entity_b.uid],
                data: {label: video2.uploader, type: 'channel'},
                stroke: 'red',
              },
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
          nodes: array.concat([
            {
              type: 'node',
              id: item.entity_b.uid,
              next: [],
              data: {label: item.entity_b.metadata.name, type: 'video'},
              stroke: 'blue',
            },
          ]),
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
              {
                type: 'node',
                id: item.entity_a.uid,
                next: [],
                data: {label: item.entity_a.metadata.name, type: 'video'},
                stroke: 'blue',
              },
              {
                type: 'node',
                id: video.uploader,
                next: [item.entity_a.uid],
                data: {label: video.uploader, type: 'channel'},
                stroke: 'red',
              },
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
            array.concat([
              {
                type: 'node',
                id: item.entity_a.uid,
                next: [],
                data: {label: item.entity_a.metadata.name, type: 'video'},
                stroke: 'blue',
              },
            ]),
        };
      });
    } else {
      setList((prev: any) => {
        if (filteredData1.length === 0 && filteredData2.length === 0) {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              {
                type: 'node',
                id: item.entity_a.uid,
                next: [item.entity_b.uid],
                data: {label: item.entity_a.metadata.name, type: 'video'},
                stroke: 'blue',
              },
              {
                type: 'node',
                id: item.entity_b.uid,
                next: [],
                data: {label: item.entity_b.metadata.name, type: 'video'},
                stroke: 'blue',
              },
              {
                type: 'node',
                id: video.uploader,
                next: [item.entity_a.uid],
                data: {label: video.uploader, type: 'channel'},
                stroke: 'red',
              },
              {
                type: 'node',
                id: video2.uploader,
                next: [item.entity_b.uid],
                data: {label: video2.uploader, type: 'channel'},
                stroke: 'red',
              },
            ],
          };
        } else if (filteredData1.length === 0) {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              {
                type: 'node',
                id: item.entity_a.uid,
                next: [item.entity_b.uid],
                data: {label: item.entity_a.metadata.name, type: 'video'},
                stroke: 'blue',
              },
              {
                type: 'node',
                id: item.entity_b.uid,
                next: [],
                data: {label: item.entity_b.metadata.name, type: 'video'},
                stroke: 'blue',
              },
              {
                type: 'node',
                id: video.uploader,
                next: [item.entity_a.uid],
                data: {label: video.uploader, type: 'channel'},
                stroke: 'red',
              },
              // add b to existing video2.uploader next list
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
              {
                type: 'node',
                id: item.entity_a.uid,
                next: [item.entity_b.uid],
                data: {label: item.entity_a.metadata.name, type: 'video'},
                stroke: 'blue',
              },
              {
                type: 'node',
                id: item.entity_b.uid,
                next: [],
                data: {label: item.entity_b.metadata.name, type: 'video'},
                stroke: 'blue',
              },
              // add a to existing video.uploader next list
              {
                ...filteredData1[0],
                next: [...filteredData1[0].next, item.entity_a.uid],
              },
              {
                type: 'node',
                id: video2.uploader,
                next: [item.entity_b.uid],
                data: {label: video2.uploader, type: 'channel'},
                stroke: 'red',
              },
            ],
          };
        }
        else {
          return {
            ...prev,
            nodes: [
              ...prev.nodes,
              {
                type: 'node',
                id: item.entity_a.uid,
                next: [item.entity_b.uid],
                data: {label: item.entity_a.metadata.name, type: 'video'},
                stroke: 'blue',
              },
              {
                type: 'node',
                id: item.entity_b.uid,
                next: [],
                data: {label: item.entity_b.metadata.name, type: 'video'},
                stroke: 'blue',
              },
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
            <Board nodesList={list} ready={ready} />
          </Box>
        </FullScreen>
      </Container>
    </>
  );
};

export default GraphPage;
