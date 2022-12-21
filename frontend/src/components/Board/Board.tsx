import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  ControlButton,
  Controls, useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import FloatingEdge from './FloatingEdge';
import { createNodesAndEdges } from './utils';

import './styles.css';
import CustomNode from './CustomNode';
import { useHistory } from 'react-router';
import { FullscreenExit } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dagre = require('dagre');

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (
  nodes: any,
  edges: any,
  direction = 'TB'
) => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node: any) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge: any) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node: any) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};


const Board: React.FC<{
  nodesList: any;
  ready: boolean;
  mixedLayout: boolean;
  onClickHandler: (idx: any) => void;
}> = ({ nodesList, ready, mixedLayout, onClickHandler }) => {
  const reactFlowInstance = useReactFlow();
  const history = useHistory();
  const navigateToComparisonPage = (source: string, target: string) =>
    history.push(`/comparison?uidA=${source}&uidB=${target}`);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, type: 'floating' }, eds))
      // navigate to comparison page
      navigateToComparisonPage(params.source, params.target);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [setEdges]
  );

  function CustomControls() {
    return (
      <Controls>
        <ControlButton onClick={() => document.exitFullscreen()}>
          <FullscreenExit />
        </ControlButton>
      </Controls>
    );
  }

  React.useEffect(() => {
    if (ready) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        createNodesAndEdges(nodesList, onClickHandler);

      if (mixedLayout) {
        const { nodes: nodesWithLayout, edges: edgesWithLayout } =
          getLayoutedElements(layoutedNodes, layoutedEdges);
        setNodes(nodesWithLayout);
        setEdges(edgesWithLayout);
      } else {
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesList, ready, mixedLayout]);

  React.useEffect(() => {
    reactFlowInstance.fitView();
  }, [nodes]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="floatingedges">
      {ready ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
        >
          <CustomControls />
          <Background />
        </ReactFlow>
      ) : (
        <CircularProgress sx={{ mt: 2, ml: 2 }} />
      )}
    </div>
  );
};

export default Board;
