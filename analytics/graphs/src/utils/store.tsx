import { configureStore } from '@reduxjs/toolkit';
import { NotificationReducer } from './reducers/notificationSlice';

export default configureStore({
    reducer: {
        notification: NotificationReducer
    },
})
