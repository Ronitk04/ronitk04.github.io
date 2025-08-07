export async function callGemini(prompt, button) {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner spinner"></i> Thinking...`;

    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = ""; // Left empty as per instructions
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected API response structure:", result);
            return "Sorry, I couldn't generate a response right now.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred. Please try again.";
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

export async function searchUnsplashImages(query) {
    // In a real app, you would get this from a secure place, not commit it to the repo
    const UNSPLASH_API_KEY = 'YOUR_UNSPLASH_API_KEY_HERE'; // Replace with a real key
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=4&client_id=${UNSPLASH_API_KEY}`;

    // Since I cannot make external API calls in this environment, I will return mock data.
    // In a real scenario, you would fetch the URL above.
    console.log(`Searching Unsplash for: ${query}`);

    // Mock data simulating a real API response
    const mockImages = [
        { urls: { small: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' } },
        { urls: { small: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' } },
        { urls: { small: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' } },
        { urls: { small: 'https://images.unsplash.com/photo-1491553662413-833eac6ca3a5?w=400' } },
    ];

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockImages);
        }, 500); // Simulate network delay
    });

    /*
    // REAL IMPLEMENTATION:
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results; // Array of image objects
    } catch (error) {
        console.error("Error fetching from Unsplash:", error);
        return []; // Return empty array on error
    }
    */
}
