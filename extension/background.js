chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPLOAD_OBJECT') {
    chrome.storage.local.get(['qatrack_token', 'qatrack_url'], async (data) => {
      const { qatrack_token, qatrack_url } = data;
      if (!qatrack_token || !qatrack_url) {
        console.error("QATrack Extension: Not authenticated");
        return;
      }

      try {
        const res = await fetch(`${qatrack_url}/objects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${qatrack_token}`
          },
          body: JSON.stringify(request.payload)
        });

        if (res.ok) {
          // Success notification
          console.log("QATrack Extension: Object saved successfully.");
        } else {
          console.error("QATrack Extension: Failed to save object", await res.text());
        }
      } catch (err) {
        console.error("QATrack Extension: Network error", err);
      }
    });
  }
});
