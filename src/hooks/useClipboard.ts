import { Clipboard } from "@raycast/api";
import { useEffect, useState } from "react";

type SelectionState = {
  text: string;
  isLoading: boolean;
};

export function useSelectionOrClipboard(): SelectionState {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadText() {
      setIsLoading(true);

      try {
        let nextText = "";
        try {
          const clipboardText = await Clipboard.readText();
          if (clipboardText) {
            nextText = clipboardText;
          }
        } catch {
          nextText = "";
        }

        if (isActive) {
          setText(nextText);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadText();

    return () => {
      isActive = false;
    };
  }, []);

  return { text, isLoading };
}
