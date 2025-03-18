export function getCleanedPrivacySentences(privacySentencesStr) {
    try {
        if (typeof privacySentencesStr !== 'string') {
            console.error("Invalid input: Expected a JSON string.");
            return [];
        }

        let parsedList = JSON.parse(privacySentencesStr);

        if (!Array.isArray(parsedList)) {
            console.error("Invalid JSON format: Expected an array.");
            return [];
        }

        let cleanedSentences = parsedList.map(item => {
            if (typeof item !== 'string') return null; // Ensure it's a string

            // Regex for privacy sentences: sentence + score (no sensitive/generic terms)
            let match = item.match(/["'](.+?)["'],\s*([\d.-]+)/);

            if (match) {
                return {
                    sentence: match[1],
                    score: parseFloat(match[2]) // Extracted score
                };
            } else {
                console.warn("No match found for privacy sentence:", item);
                return null;
            }
        }).filter(Boolean); // Remove null values

        cleanedSentences.sort((a, b) => a.score - b.score);
        return cleanedSentences;
    } catch (error) {
        console.error("Error parsing privacy sentences:", error);
        return [];
    }
}

export function getCleanedSensitiveSentences(sensitiveSentencesStr) {
    try {
        if (typeof sensitiveSentencesStr !== 'string') {
            console.error("Invalid input: Expected a JSON string.");
            return [];
        }

        let parsedList = JSON.parse(sensitiveSentencesStr);

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
                console.warn("No match found for senstivie sentence:", item);
                return null;
            }
        }).filter(Boolean); // Remove null values

        cleanedSentences.sort((a, b) => a.score - b.score);
        return cleanedSentences;
    } catch (error) {
        console.error("Error parsing sensitive sentence:", error);
        return [];
    }
}

export function getCleanedGenericSentences(genericSentencesStr) {
    try {
        if (typeof genericSentencesStr !== 'string') {
            console.error("Invalid input: Expected a JSON string.");
            return [];
        }

        let parsedList = JSON.parse(genericSentencesStr);

        if (!Array.isArray(parsedList)) {
            console.error("Invalid JSON format: Expected an array.");
            return [];
        }

        let cleanedSentences = parsedList.map(item => {
            if (typeof item !== 'string') return null; // Ensure it's a string

            // Regex to match both an array or a single string for the generic term
            let match = item.match(/["'](.+?)["'],\s*(?:\[(.*?)\]|["'](.+?)["']),\s*([\d.-]+)/);

            if (match) {
                let sentence = match[1]; // Extracted sentence
                let rawTerms = match[2] ? match[2].split(",").map(term => term.trim()) : [match[3]]; // Handle array or single string
                let score = parseFloat(match[4]); // Extracted score

                // Capitalize first letter of each term
                let formattedTerms = rawTerms.map(term => term.charAt(0).toUpperCase() + term.slice(1)).join(", ");

                return {
                    sentence,
                    genericTerms: formattedTerms,
                    score
                };
            } else {
                console.warn("No match found for generic sentence:", item);
                return null;
            }
        }).filter(Boolean); // Remove null values

        cleanedSentences.sort((a, b) => a.score - b.score);
        return cleanedSentences;
    } catch (error) {
        console.error("Error parsing generic sentences:", error);
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
            'camera': 'Camera',
            'storage': 'Storage',
            'microphone': 'Microphone',
            'contacts': 'Contacts',
            'network': 'Network',
            'other': 'Other'
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

                return { permission, description, score };
            }
            return null;
        })
        .filter(Boolean)  // Remove null entries
        .filter(item => item.score !== 1); // Exclude scores equal to 1

        return cleanedPermissions;
    } catch (error) {
        console.error("Error parsing worst permissions:", error);
        return [];
    }
}

export function getAllPermissions(allPermissionsStr) {
    try {
        if (typeof allPermissionsStr !== 'string') {
            console.error("Invalid input: Expected a string.");
            return [];
        }

        // Define a mapping for permissions that need to be cleaned or grouped
        const permissionMappings = {
            'calendar': 'Calendar',
            'photos/media/files': 'Photos/Media/Files',
            'location': 'Location',
            'camera': 'Camera',
            'storage': 'Storage',
            'microphone': 'Microphone',
            'contacts': 'Contacts',
            'network': 'Network',
            'other': 'Other'
        };

        // Convert the string into an array by splitting on `;`
        let permissionList = allPermissionsStr.split(";").map(item => item.trim());

        // Extract permission and category
        let cleanedPermissions = permissionList.map(item => {
            let match = item.match(/(.+?)\s*\((.+?)\)/); // Extracts "Permission" and "Category"
            if (match) {
                let description = match[1].toLowerCase(); // Normalize to lowercase
                let permission = match[2];

                // Apply permission mappings if available
                if (permissionMappings[permission]) {
                    permission = permissionMappings[permission];
                } else {
                    permission = permission.charAt(0).toUpperCase() + permission.slice(1);
                }

                return {
                    permission,
                    description
                };
            }
            return null;
        }).filter(Boolean); // Remove null entries

        return cleanedPermissions;
    } catch (error) {
        console.error("Error parsing permissions:", error);
        return [];
    }
}
