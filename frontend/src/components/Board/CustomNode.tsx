import React from 'react';
import { Handle, Position } from 'reactflow';
import { Tooltip } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import UserIcon from '@mui/icons-material/Person';
import { useDispatch } from 'react-redux';
import { toggleDrawer } from '../../utils/reducers/drawerSlice';

const CustomNode = ({ data, selected }: any) => {
  const dispatch = useDispatch();

  return (
    <div
      style={{
        backgroundColor:
          data.type === 'channel'
            ? 'rgba(171,205,239,0.9)'
            : data.type === 'video'
            ? 'rgba(255,193,204,0.9)'
            : 'rgba(217,217,217,0.9)',
        padding: '14px',
        borderRadius: '5px',
        height: '50px',
        boxShadow: selected ? '0 0 0 2px #000' : '0 0 0 2px #e0e0e0',
      }}
      onClick={() => {
        if (data.onClickHandler) {
          data.onClickHandler(data.id);
        }
      }}
    >
      <Tooltip title={data.label} placement={'top'}>
        {data.type === 'video' ? (
          <YouTubeIcon sx={{ fontSize: 22.5 }} color={'error'} />
        ) : data.type === 'ghost' ? (
          <YouTubeIcon sx={{ fontSize: 22.5, color: 'grey' }} />
        ) : (
          <UserIcon
            sx={{ fontSize: 22.5 }}
            color={'secondary'}
            onClick={() => dispatch(toggleDrawer({ id: data.label }))}
          />
        )}
      </Tooltip>

      {(data.type === 'video' || data.type === 'ghost') && (
        <Handle type={'target'} position={Position.Left} />
      )}
      <Handle
        type={'source'}
        position={Position.Right}
        isConnectable={data.type !== 'channel'}
      />
    </div>
  );
};

export default CustomNode;
