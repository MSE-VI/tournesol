import React, { useState } from 'react';

import { Handle, Position } from 'react-flow-renderer';
import {
  Card,
  CardContent, Tooltip,
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import UserIcon from '@mui/icons-material/Person';
import { useDispatch } from 'react-redux';
import { useNotification } from '../../utils/useNotification';

const CustomNode = ({ data, styles }: any) => {
  const dispatch = useDispatch();
  const { displayNotification } = useNotification();

  const [array, setArray] = useState<{ field: string; value: string | Blob }[]>(
    []
  );

  React.useEffect(() => {
    setArray(data);
  }, [data]);

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Tooltip title={data.label} placement={'top'}>
            {data.type === 'video' ? (
              <YouTubeIcon sx={{ fontSize: 30 }} />
            ) : (
              <UserIcon sx={{ fontSize: 30 }} />
            )}
          </Tooltip>
        </CardContent>
      </Card>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default CustomNode;
