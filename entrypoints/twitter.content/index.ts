import "./twitter.css";

// const apiUrl = "https://www.setutu.vip/server/v1"
const apiUrl = "http://localhost:9000/v1";

export default defineContentScript({
  matches: ["*://*.twitter.com/*", "*://x.com/*"],
  main: (ctx) => {
    if (!ctx.isValid) {
      console.warn(
        "Twitter Save Button: Context initially invalid. Script will not run."
      );
      return;
    }

    const createSaveButton = (
      tweetElement: HTMLElement,
      imageUrls: string[]
    ) => {
      const existingButton = tweetElement.querySelector(
        ".setutu-save-image-button"
      );

      if (existingButton) {
        return;
      }

      const button = document.createElement("button");
      button.textContent = "Save Image";
      button.className = "setutu-save-image-button";

      button.addEventListener("click", async (event) => {
        if (ctx.isInvalid) {
          console.log("Context invalidated, button click ignored.");
          return;
        }
        event.stopPropagation();
        event.preventDefault();

        try {
          await fetch(`${apiUrl}/protected/images`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${window.localStorage.getItem(
                "SETUTU_JWT"
              )}`,
            },
            body: JSON.stringify({
              imageUrls,
              source: "twitter",
            }),
          });
        } catch (error) {
          alert(`Error saving image: ${(error as Error).message}`);
        }
      });

      // Attempt to append to the action toolbar first
      // Common selector for Twitter's action button group
      const actionToolbar = tweetElement.querySelector(
        'div[role="group"][id^="id__"]'
      );
      if (actionToolbar) {
        const existingButton = actionToolbar.querySelector(
          ".setutu-save-image-button"
        );

        if (!existingButton) {
          actionToolbar.appendChild(button);
        }
      } else {
        const existingButton = tweetElement.querySelector(
          ".setutu-save-image-button"
        );

        if (!existingButton) {
          tweetElement.appendChild(button);
        }
      }
    };

    const processTweetNode = (tweetNode: HTMLElement) => {
      if (ctx.isInvalid) {
        return;
      }

      const imageElements = tweetNode.querySelectorAll<HTMLImageElement>(
        'div[data-testid="cellInnerDiv"] img[src*="/media/"]'
      );

      if (imageElements.length > 0) {
        const imageUrls = Array.from(imageElements).map(
          (imageElement) => imageElement.src
        );

        createSaveButton(tweetNode, imageUrls);
      }
    };

    const observer = new MutationObserver((mutationsList) => {
      if (ctx.isInvalid) {
        observer.disconnect();
        return;
      }

      const tweetNodes = document.querySelectorAll(
        'article[data-testid="tweet"]'
      );
      for (const tweetNode of tweetNodes) {
        processTweetNode(tweetNode as HTMLElement);
      }
    });

    const primaryColumn = document.querySelector(
      'div[data-testid="primaryColumn"]'
    );

    observer.observe(primaryColumn || document.body, {
      childList: true,
      subtree: true,
    });
  },
});
