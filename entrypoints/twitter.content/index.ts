import "./twitter.css";
import { toast } from "../../libs/toast";

const API_BASE_URL =
  window.localStorage.getItem("SETUTU_API_BASE_URL") ||
  "https://www.setutu.vip/server/v1";

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

      button.addEventListener("mouseenter", async (event) => {
        if (ctx.isInvalid) {
          toast("Context invalidated, button click ignored.");
          return;
        }

        if (!API_BASE_URL) {
          toast("API base URL not set. Copy one from console log.");
          console.error(
            "API base URL should be http://localhost:9000/v1 or https://www.setutu.vip/server/v1"
          );
          return;
        }

        event.stopPropagation();
        event.preventDefault();

        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = "Saving...";

        try {
          const response = await fetch(`${API_BASE_URL}/protected/images`, {
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

          if (!response.ok) {
            throw new Error("Failed to save image");
          }

          const json = await response.json();
          const { code, data, message } = json;

          if (code !== 201 || !data?.success) {
            throw new Error(message);
          }

          toast("Image saved successfully");
        } catch (error) {
          toast(`Error saving image: ${(error as Error).message}`);
        } finally {
          button.disabled = false;
          button.textContent = originalText;
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
