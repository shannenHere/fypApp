import { InstalledApps } from 'react-native-launcher-kit';

// Function to get all installed applications
const getAllInstalledApplications = async () => {
  try {
    console.log('Fetching all installed applications...');

    const apps = await InstalledApps.getApps(); // Fetch all apps
    console.log('Installed applications:', apps);
    
    return apps;
  } catch (error) {
    console.error('Error fetching installed applications:', error);
    return [];
  }
};

export { getAllInstalledApplications };
