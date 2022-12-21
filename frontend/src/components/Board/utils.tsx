// source: https://reactflow.dev/docs/examples/edges/floating-edges/
import { Position, MarkerType } from 'reactflow';

const nodeWidth = 50;
const nodeHeight = 50;

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(
  intersectionNode: { width: any; height: any; positionAbsolute: any },
  targetNode: { positionAbsolute: any }
) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const {
    width: intersectionNodeWidth,
    height: intersectionNodeHeight,
    positionAbsolute: intersectionNodePosition,
  } = intersectionNode;
  const targetPosition = targetNode.positionAbsolute;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + w;
  const y1 = targetPosition.y + h;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(
  node: { positionAbsolute: any },
  intersectionPoint: { x: any; y: any }
) {
  const n = { ...node.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: any, target: any) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

export function createNodesAndEdges(nodeList: any, onClickHandler: any) {
  const nodes: any = [];
  const edges: any = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  if (nodeList.nodes && nodeList.nodes.length > 0) {
    nodeList.nodes.forEach((node: any, index: any) => {
      const degrees = index * (360 / nodeList.nodes.length);
      const radians = degrees * (Math.PI / 180);
      const x = 250 * Math.cos(radians) + center.x;
      const y = 250 * Math.sin(radians) + center.y;
      nodes.push({
        id: node.id,
        type: 'customNode',
        next: node.next,
        data: {
          id: node.id,
          label: node.data.label,
          type: node.data.type,
          onClickHandler: node.data.type == 'video' ? onClickHandler : null,
        },
        position: { x, y },
        style: {
          width: `${nodeWidth}px`,
          backgroundColor: 'rgba(255, 255, 255, 0)',
        },
        selected: false,
        stroke: node.stroke,
      });
      node.next.forEach((next: any) => {
        const randomId = Math.random().toString(36).substring(7);
        edges.push({
          id: randomId,
          target: next,
          source: node.id,
          type: 'floating',
          animated: false,
          style: { stroke: node.stroke },
        });
      });
    });
  }

  return { nodes, edges };
}
