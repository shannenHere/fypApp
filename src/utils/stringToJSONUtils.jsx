export function getCleanedSensitiveSentences(senstiveSetencesStr) {
    try {
        if (typeof senstiveSetencesStr !== 'string') {
            console.error("Invalid input: Expected a JSON string.");
            return [];
        }

        let parsedList = JSON.parse(senstiveSetencesStr);

        if (!Array.isArray(parsedList)) {
            console.error("Invalid JSON format: Expected an array.");
            return [];
        }

        let cleanedSentences = parsedList.map(item => {
            if (typeof item !== 'string') return null; // Ensure it's a string

            // Updated regex to capture: sentence, sensitive terms, and score
            let match = item.match(/["'](.+?)["'],\s*(\[[^\]]+\]),\s*([\d.-]+)/);

            if (match) {
                let sentence = match[1]; // Extracted sentence
                let rawTerms = JSON.parse(match[2].replace(/'/g, '"')); // Convert array string to actual array
                
                // Format sensitive terms: Capitalize first letter & separate with commas
                let formattedTerms = rawTerms
                    .map(term => term.charAt(0).toUpperCase() + term.slice(1)) // Capitalize
                    .join(", "); // Convert array to a formatted string

                return {
                    sentence,
                    sensitiveTerms: formattedTerms,
                    score: parseFloat(match[3]) // Extracted score
                };
            } else {
                console.warn("No match found for:", item);
                return null;
            }
        }).filter(Boolean); // Remove null values

        cleanedSentences.sort((a, b) => a.score - b.score);
        return cleanedSentences;
    } catch (error) {
        console.error("Error parsing privacy concerns:", error);
        return [];
    }
}

export function getWorstPermissions(worstPermissionsStr) {
    try {
        // Convert JSON string to an array
        let parsedList = JSON.parse(worstPermissionsStr);

        // Define a mapping for permissions that need to be cleaned or grouped
        const permissionMappings = {
            'calendar': 'Calendar',
            'photos/media/files': 'Photos/Media/Files',
            'location': 'Location',
            'camera': 'Camera'
        };

        // Extract permission name, description, and score
        let cleanedPermissions = parsedList.map(item => {
            let match = item.match(/\('(.+?)', '(.+?)', (\d+(\.\d+)?)\)/);
            if (match) {
                let permission = match[1].toLowerCase(); // Convert to lowercase for matching
                let description = match[2];
                let score = parseFloat(match[3]);

                // Apply permission mapping if available
                if (permissionMappings[permission]) {
                    permission = permissionMappings[permission];
                } else {
                    permission = permission.charAt(0).toUpperCase() + permission.slice(1); // Capitalize first letter
                }

                return {
                    permission,
                    description,
                    score
                };
            }
            return null;
        }).filter(Boolean); // Remove null entries

        return cleanedPermissions;
    } catch (error) {
        console.error("Error parsing worst permissions:", error);
        return [];
    }
}
