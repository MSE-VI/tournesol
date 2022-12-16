// eslint-disable-next-line @typescript-eslint/no-var-requires
const dagre = require('dagre');

const nodeWidth = 50;
const nodeHeight = 50;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export default function DrawGraph(
  serviceConfiguration: { nodes?: any } | null,
  onClickHandler: (idx: any) => void
) {
  let nodes: any[] = [];
  let edges: any[] = [];

  if (
    serviceConfiguration !== null &&
    Object.keys(serviceConfiguration).length > 0
  ) {
    const nodesConfig = serviceConfiguration.nodes;

    for (const idx in nodesConfig) {
      const node = nodesConfig[idx];

      if (node.type !== 'loop') {
        const newNode = getNode(node, () => onClickHandler(idx));
        const newEdges = getEdge(newNode);
        nodes = [...nodes, newNode];
        edges = [...edges, newEdges];
      } else {
        const newNodes = handleLoop(node, () => onClickHandler(idx));
        nodes = nodes.concat(newNodes);
        edges = edges.concat(newNodes.map((n) => getEdge(n).flat()));
      }
    }
    edges = edges.flat();
    return getAlignedElements(nodes, edges);
  }
  return { nodes, edges };
}

const getAlignedElements = (nodes: any[], edges: any[]) => {
  const direction = 'TB';

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes
    .filter((node) => !Object.prototype.hasOwnProperty.call(node, 'parentNode'))
    .forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = 'left';
      node.sourcePosition = 'right';

      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };

      return node;
    });

  let loopY = 20;
  nodes
    .filter((node) => Object.prototype.hasOwnProperty.call(node, 'parentNode'))
    .forEach((node) => {
      node.targetPosition = 'top';
      node.sourcePosition = 'bottom';

      node.position = {
        x: 25,
        y: loopY,
      };
      loopY += 2 * nodeHeight;
    });

  return { nodes, edges };
};

function handleLoop(
  node: { id: any; nodes: any[]; next: any },
  onClickHandler: () => void
) {
  const groupName = node.id;
  const startNodes = [
    {
      id: groupName,
      position: { x: 0, y: 0 },
      style: {
        height: `${(node.nodes.length + 1) * 110}px`,
        width: `${nodeWidth}px`,
        backgroundColor: 'rgba(255, 255, 255, 0)',
      },
      next: node.next,
    },
    {
      id: 'loopBegin',
      type: 'input',
      position: { x: 0, y: 0 },
      data: { label: 'loopBegin' },
      parentNode: groupName,
      extent: 'parent',
      next: [node.nodes[0].id],
    },
  ];

  const loopNodes = node.nodes.map((n) => {
    const newNode: any = getNode(n, onClickHandler);
    newNode.parentNode = groupName;
    newNode.extent = 'parent';
    return newNode;
  });

  loopNodes.push({
    id: 'loopEnd',
    type: 'output',
    position: { x: 0, y: 0 },
    data: { label: 'loopEnd' },
    next: [],
    parentNode: groupName,
    extent: 'parent',
  });

  return startNodes.concat(loopNodes);
}

function getEdge(node: any) {
  let edges: any[] = [];
  let countEdges = 0;
  for (const nxt in node.next) {
    const randomId = Math.random().toString(36).substring(7);
    const edge = {
      // id as random number
      id: `${randomId}`,
      source: node.id,
      target: node.next[nxt],
      animated: false,
      style: { stroke: node.stroke },
    };
    edges = [...edges, edge];
    countEdges += nodeWidth;
  }
  return edges;
}

function getNode(node: any, onClickHandler: () => void) {
  let next: any[] = [];
  let label = node.data.label;

  switch (node.type) {
    case 'branch':
      ['then', 'else'].forEach((p) => {
        next = next.concat(
          Object.prototype.hasOwnProperty.call(node[p], 'next')
            ? node[p].next
            : []
        );
      });

      if (Object.prototype.hasOwnProperty.call(node, 'next')) {
        next = next.concat(node.next);
      }
      break;
    case 'node':
      if (Object.prototype.hasOwnProperty.call(node, 'ready')) {
        label = `${node.id} \n with ready condition`;
      } else if (Object.prototype.hasOwnProperty.call(node, 'after')) {
        label = `${node.id} \n with after condition`;
      }
      next = node.next;
      break;
    default:
      next = node.next;
      break;
  }
  return {
    id: node.id,
    type: 'customNode',
    next: next,
    data: {
      id: node.id,
      label: label,
      type: node.data.type,
      onClickHandler: onClickHandler,
    },
    position: { x: 0, y: 0 },
    style: {
      width: `${nodeWidth}px`,
      backgroundColor: 'rgba(255, 255, 255, 0)',
    },
    stroke: node.stroke,
  };
}

/*function getTypeOfNode(node: any) {
  switch (node.type) {
    case 'entry':
      return 'input';
    case 'end':
      return 'output';
    default:
      return '';
    }
}*/
