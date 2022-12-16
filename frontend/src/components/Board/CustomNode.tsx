import React, { useState } from 'react';

import { Handle, Position } from 'react-flow-renderer';
import { Tooltip } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import UserIcon from '@mui/icons-material/Person';
import { useDispatch } from 'react-redux';
import { toggleDrawer } from '../../utils/reducers/drawerSlice';
import { useHistory } from 'react-router-dom';

const CustomNode = ({ data, styles, selected }: any) => {
  const history = useHistory();
  const navigateToEntityPage = (entity: string) =>
    history.push(`/entities/${entity}`);
  const dispatch = useDispatch();

  const [array, setArray] = useState<{ field: string; value: string | Blob }[]>(
    []
  );

  //const [selected, setSelected] = useState(false);

  React.useEffect(() => {
    setArray(data);
  }, [data]);

  return (
    <div
      style={{
        backgroundColor:
          data.type === 'channel'
            ? 'rgba(171,205,239,0.9)'
            : 'rgba(255,193,204,0.9)',
        padding: '14px',
        borderRadius: '50px',
        height: '50px',
        boxShadow: selected ? '0 0 0 2px #000' : '0 0 0 2px #e0e0e0',
      }}
      onClick={() => {
        if (data.onClickHandler) {
          data.onClickHandler();
        } else {
          navigateToEntityPage(data.id);
        }
      }}
    >
      <Tooltip title={data.label} placement={'top'}>
        {data.type === 'video' ? (
          <YouTubeIcon sx={{ fontSize: 22.5 }} color={'error'} />
        ) : (
          <UserIcon
            sx={{ fontSize: 22.5 }}
            color={'secondary'}
            onClick={() => dispatch(toggleDrawer({ id: data.label }))}
          />
        )}
      </Tooltip>

      {data.type === 'video' && (
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
