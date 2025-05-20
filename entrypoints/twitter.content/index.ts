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
      imageUrl: string,
      max: number
    ) => {
      const existingButtons = tweetElement.querySelectorAll(
        ".setutu-save-image-button"
      );

      if (existingButtons.length >= max) {
        return;
      }

      const button = document.createElement("button");
      button.textContent = "Save Image";
      button.className = "setutu-save-image-button"; // Your unique class name
      button.style.marginLeft = "10px";
      button.style.padding = "5px 10px";
      button.style.border = "1px solid #ccc";
      button.style.borderRadius = "5px";
      button.style.cursor = "pointer";
      button.style.backgroundColor = "#57A9FB";
      // Add any other critical styles, or import a dedicated CSS file:
      // import './style.css'; (create this file in the same directory)

      button.addEventListener("click", async (event) => {
        if (ctx.isInvalid) {
          console.log("Context invalidated, button click ignored.");
          return;
        }
        event.stopPropagation();
        event.preventDefault();
      });

      // Attempt to append to the action toolbar first
      // Common selector for Twitter's action button group
      const actionToolbar = tweetElement.querySelector(
        'div[role="group"][id^="id__"]'
      );
      if (actionToolbar) {
        const existingButtons = actionToolbar.querySelectorAll(
          ".setutu-save-image-button"
        );

        if (existingButtons.length < max) {
          actionToolbar.appendChild(button);
        }
      } else {
        const existingButtons = tweetElement.querySelectorAll(
          ".setutu-save-image-button"
        );

        if (existingButtons.length < max) {
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
        for (const imageElement of imageElements) {
          createSaveButton(tweetNode, imageElement.src, imageElements.length);
        }
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
