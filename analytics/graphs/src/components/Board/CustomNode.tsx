import React, { useState } from "react";

import { Handle, Position } from "react-flow-renderer";
import {
    Button,
    Card,
    CardContent,
    Divider,
    Input,
    Tooltip,
    Typography
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNotification } from '../../utils/useNotification';

const CustomNode = ({data, styles}: any) => {
    const dispatch = useDispatch();
    const { displayNotification } = useNotification();

    const [array, setArray] = useState<{ field: string; value: string | Blob }[]>([]);


    React.useEffect(() => {
        console.log(data);
        setArray(data);
    }, [data]);

    return (
        <>
            <Card
                sx={{height: '100%', display: 'flex', flexDirection: 'column'}}
            >
                <CardContent sx={{flexGrow: 1}}>
                    <Typography variant={"subtitle1"} color={"secondary"}>{data.label}</Typography>
                    {(data.body) ?
                        array.map((item: any, index: number) => {
                            return (
                                <div key={`div-${index}`}>
                                    <Typography variant={"body2"} key={`field-${index}`} sx={{mt: 1}}>
                                        {item.field}
                                    </Typography>
                                    {(item.type === "text/plain") ?
                                        (<Input key={`input-${index}`} placeholder={"Enter text"}/>)
                                        :
                                        (<Tooltip title={"type(s): " + item.type} placement={"right"}>
                                            <Button key={`btn-${index}`} variant={"outlined"} component={"label"}
                                                    size={"small"} sx={{mb: 1, mt: 1}}
                                                    color={item.isSet ? 'success' : 'primary'}>
                                                Upload
                                                <input
                                                    accept={item.type}
                                                    type={"file"}
                                                    hidden
                                                />
                                            </Button>
                                        </Tooltip>)}
                                    <Divider/>
                                </div>
                            );
                        })
                        :
                        <Typography></Typography>
                    }
                </CardContent>
            </Card>

            {(!data.label.includes("entry")) ?
                <Handle
                    type="target"
                    position={Position.Left}
                /> : <></>}
            {(!data.label.includes("end")) ?
                <Handle
                    type="source"
                    position={Position.Right}
                /> : <></>}
        </>
    );
};

export default CustomNode;
