import React, { useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MiniMap,
} from 'react-flow-renderer';
import { useHistory } from 'react-router-dom';
import DrawGraph from './DrawGraph';
import SelectorNode from './CustomNode';
import { ControlButton } from 'reactflow';
import { FullscreenExit } from '@mui/icons-material';

import './styles.css';
import { CircularProgress } from '@mui/material';
import { useCurrentPoll } from '../../hooks';

const Board: React.FC<{ nodesList: any; ready: boolean }> = ({
  nodesList,
  ready,
}) => {
  const history = useHistory();
  const navigateToComparisonPage = (source: string, target: string) =>
    history.push(`/comparison?uidA=${source}&uidB=${target}`);
  const nodeTypes = useMemo(() => ({ customNode: SelectorNode }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const pollName = useCurrentPoll();

  const onConnect = useCallback((params: any) => {
    console.log(params);
    setEdges((eds: any) => addEdge({ ...params, animated: true }, eds));
    // navigate to comparison page
    navigateToComparisonPage(params.source, params.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function CustomControls() {
    return (
      <Controls>
        <ControlButton onClick={() => document.exitFullscreen()}>
          <FullscreenExit />
        </ControlButton>
      </Controls>
    );
  }

  useEffect(() => {
    if (ready) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        DrawGraph(nodesList);
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesList, ready]);

  useEffect(() => {
    // console.log('nodes', nodes);
    // console.log('edges', edges);
  }, [nodes, edges]);

  return (
    <ReactFlowProvider>
      {ready ? (
        <ReactFlow
          id="board"
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <CustomControls />
          <Background />
        </ReactFlow>
      ) : (
        <CircularProgress sx={{ mt: 2, ml: 2 }} />
      )}
    </ReactFlowProvider>
  );
};

export default Board;
