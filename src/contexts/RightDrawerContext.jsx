import React, { createContext, useState } from 'react';
import { DrawerActions, useNavigation } from '@react-navigation/native';

export const RightDrawerContext = createContext();

export const RightDrawerProvider = ({ children, navigation }) => {
    const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

    const openRightDrawer = () => {
        setIsRightDrawerOpen(true);
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const closeRightDrawer = () => {
        setIsRightDrawerOpen(false);
        navigation.dispatch(DrawerActions.closeDrawer());
    };

    return (
        <RightDrawerContext.Provider value={{ openRightDrawer, closeRightDrawer }}>
            {children}
        </RightDrawerContext.Provider>
    );
};