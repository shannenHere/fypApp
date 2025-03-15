import React, { createContext, useState, useContext } from "react";

const AppListContext = createContext();

export const AppListProvider = ({ children }) => {
  const [installedAppsInDB, setInstalledAppsInDB] = useState([]); // Installed apps found in database
  const [installedAppsNotInDB, setInstalledAppsNotInDB] = useState([]); // Installed apps not found in database

  return (
    <AppListContext.Provider value={{ installedAppsInDB, setInstalledAppsInDB, installedAppsNotInDB, setInstalledAppsNotInDB }}>
      {children}
    </AppListContext.Provider>
  );
};

export const useAppList = () => useContext(AppListContext); // Custom hook
