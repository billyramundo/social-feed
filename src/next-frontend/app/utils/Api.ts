const api_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";

// Define a caching mechanism for fetch requests
const fetchCache = {};

// Enhance the caching mechanism with a method to invalidate the cache after 3 seconds
const cacheResult = (url, promise) => {
    fetchCache[url] = promise;

    // Invalidate this cache entry after 3 seconds
    setTimeout(() => {
        delete fetchCache[url];
    }, 3000); // 3000 milliseconds = 3 seconds
};

export const ApiGet = async (route) => {
    const ms = Date.now();
    const api_full = `${api_url}${route}`;

    // Use the full URL, including the dummy parameter, for caching
    if (!fetchCache[api_full]) {
        let api_use = api_full;
        api_use += api_full.includes("?") ? "&dummy=" + ms : "?dummy=" + ms;

        // If not cached, perform the fetch and cache the promise
        const fetchPromise = fetch(api_use, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok && !response.redirected) {
                    if (response.status == 302) {
                        return response.json().then((resp) => {
                            if (typeof window !== "undefined") {
                                window.location.href = resp.redirect;
                            }
                        });
                    }
                    throw new Error("Network response was not ok.");
                }
                return response.json();
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                // Ensure this promise is removed from cache if it fails, so retries can happen
                delete fetchCache[api_full];
            });

        cacheResult(api_full, fetchPromise);
    }

    // Return the cached or newly created promise
    return fetchCache[api_full];
};

export const ApiPost = async (route, postData) => {
    return fetch(`${api_url}${route}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    })
        .then((response) => {
            if (response.status == 302) {
                return response.json().then((resp) => {
                    if (typeof window !== "undefined") {
                        window.location.href = resp.redirect;
                    }
                });
            }

            if (!response.ok) {
                return response.json().then((resp) => {
                    throw new Error(resp.error || resp.message || "An error occurred");
                });
            }
            return response.json();
        })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error("An error occurred:", error);
            throw error;
        });
};