export function getCleanedSensitiveSentences(senstiveSetencesStr) {
    try {
        if (typeof senstiveSetencesStr !== 'string') {
            console.error("Invalid input: Expected a JSON string.");
            return [];
        }

        let parsedList = JSON.parse(senstiveSetencesStr);
        console.log("Parsed List:", parsedList);

        if (!Array.isArray(parsedList)) {
            console.error("Invalid JSON format: Expected an array.");
            return [];
        }

        let cleanedSentences = parsedList.map(item => {
            console.log("Processing Item:", item); // Debugging

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

        console.log("Cleaned Sentences:", cleanedSentences);
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

        // Extract permission name, description, and score
        let cleanedPermissions = parsedList.map(item => {
            let match = item.match(/\('(.+?)', '(.+?)', (\d+(\.\d+)?)\)/);
            return match ? { 
                permission: match[1], 
                description: match[2], 
                score: parseFloat(match[3]) 
            } : null;
        }).filter(Boolean);

        return cleanedPermissions;
    } catch (error) {
        console.error("Error parsing worst permissions:", error);
        return [];
    }
}
