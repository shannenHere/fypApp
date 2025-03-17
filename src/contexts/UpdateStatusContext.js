import React, { createContext, useState, useContext } from "react";

const UpdateStatusContext = createContext();

export const UpdateStatusProvider = ({ children }) => {
    const [updateStatusList, setUpdateStatusList] = useState([]);

    // Function to update the processing status of each app
    const updateFeedbackStatus = (appId, type, statusMessage) => {
        setUpdateStatusList(prevStatus => {
            const existingIndex = prevStatus.findIndex(item => item.appId === appId);
            if (existingIndex !== -1) {
                const updatedStatus = [...prevStatus];
                updatedStatus[existingIndex] = { 
                    ...updatedStatus[existingIndex], 
                    statusMessage,
                    isProcessing: statusMessage.includes("Processing")
                };
                return updatedStatus;
            }
            return [...prevStatus, { appId, type, statusMessage, isProcessing: statusMessage.includes("Processing") }];
        });
    };

    return (
        <UpdateStatusContext.Provider value={{ updateStatusList, updateFeedbackStatus }}>
            {children}
        </UpdateStatusContext.Provider>
    );
};

// Custom hook for easier access
export const useStatus = () => useContext(UpdateStatusContext);
