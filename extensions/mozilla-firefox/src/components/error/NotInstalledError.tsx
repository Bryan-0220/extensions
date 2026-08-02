import { useState } from "react";
import { ActionPanel, Detail, showToast, Toast } from "@raycast/api";
import { execSync } from "child_process";
import { runPowerShellScript } from "@raycast/utils";
import { platform } from "os";
import { DEFAULT_ERROR_TITLE, DownloadText, DownloadTextWindows } from "../../constants";

export function NotInstalledError() {
  const [isLoading, setIsLoading] = useState(false);
  const isWindows = platform() === "win32";

  async function handleInstall() {
    if (isLoading) return;

    setIsLoading(true);

    const toast = new Toast({ style: Toast.Style.Animated, title: "Installing..." });
    await toast.show();

    try {
      if (isWindows) {
        await runPowerShellScript("winget install Mozilla.Firefox");
      } else {
        execSync(`brew install --cask firefox`);
      }
      await toast.hide();
    } catch {
      await toast.hide();
      await showToast(Toast.Style.Failure, DEFAULT_ERROR_TITLE, "An unknown error occurred while trying to install");
    }
    setIsLoading(false);
  }

  return (
    <Detail
      actions={
        <ActionPanel>
          {!isLoading && (
            <ActionPanel.Item
              title={isWindows ? "Install with Winget" : "Install with Homebrew"}
              onAction={handleInstall}
            />
          )}
        </ActionPanel>
      }
      markdown={isWindows ? DownloadTextWindows : DownloadText}
    />
  );
}
