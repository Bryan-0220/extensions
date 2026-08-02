import { closeMainWindow, getPreferenceValues, popToRoot } from "@raycast/api";
import { exec } from "child_process";
import { existsSync } from "fs";
import { platform } from "os";
import { promisify } from "util";
import { runPowerShellScript } from "@raycast/utils";
import { Preferences, Tab } from "../interfaces";
import { SEARCH_ENGINE } from "../constants";

const execAsync = promisify(exec);

const WINDOWS_FIREFOX_PATHS: Record<string, string[]> = {
  Firefox: ["C:\\Program Files\\Mozilla Firefox\\firefox.exe", "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe"],
  "Firefox Nightly": [
    "C:\\Program Files\\Firefox Nightly\\firefox.exe",
    "C:\\Program Files (x86)\\Firefox Nightly\\firefox.exe",
  ],
  "Firefox ESR": [
    "C:\\Program Files\\Mozilla Firefox ESR\\firefox.exe",
    "C:\\Program Files (x86)\\Mozilla Firefox ESR\\firefox.exe",
  ],
  "Firefox Developer Edition": [
    "C:\\Program Files\\Firefox Developer Edition\\firefox.exe",
    "C:\\Program Files (x86)\\Firefox Developer Edition\\firefox.exe",
  ],
};

function getWindowsFirefoxExe(browserApp: string): string {
  const candidates = WINDOWS_FIREFOX_PATHS[browserApp] ?? WINDOWS_FIREFOX_PATHS["Firefox"];
  return candidates.find(existsSync) ?? "firefox.exe";
}

function escapeForPowerShell(value: string): string {
  // Escape double-quotes inside PowerShell double-quoted string
  return value.replace(/"/g, '""');
}

export async function openNewTab(queryText: string | null | undefined): Promise<boolean | string> {
  popToRoot();
  closeMainWindow({ clearRootSearch: true });

  const preferences = getPreferenceValues<Preferences>();
  const browserApp = preferences.browserApp || "Firefox";

  const searchEngine = preferences.searchEngine?.toLowerCase() || "google";
  const url = queryText
    ? `${SEARCH_ENGINE[searchEngine] ?? SEARCH_ENGINE["google"]}${encodeURIComponent(queryText)}`
    : "about:newtab";

  if (platform() === "win32") {
    const exe = getWindowsFirefoxExe(browserApp);
    await runPowerShellScript(
      `Start-Process -FilePath "${escapeForPowerShell(exe)}" -ArgumentList "${escapeForPowerShell(url)}"`,
    );
    return "success";
  }

  const command = `open -a "${browserApp}" "${url}"`;
  const { stdout } = await execAsync(command);
  return stdout || "success";
}

export async function openHistoryTab(url: string): Promise<boolean | string> {
  popToRoot();
  closeMainWindow({ clearRootSearch: true });

  const preferences = getPreferenceValues<Preferences>();
  const browserApp = preferences.browserApp || "Firefox";

  if (platform() === "win32") {
    const exe = getWindowsFirefoxExe(browserApp);
    await runPowerShellScript(
      `Start-Process -FilePath "${escapeForPowerShell(exe)}" -ArgumentList "${escapeForPowerShell(url)}"`,
    );
    return "success";
  }

  const command = `open -a "${browserApp}" "${url}"`;
  const { stdout } = await execAsync(command);
  return stdout || "success";
}

export async function setActiveTab(tab: Tab): Promise<void> {
  const preferences = getPreferenceValues<Preferences>();
  const browserApp = preferences.browserApp || "Firefox";

  if (platform() === "win32") {
    const exe = getWindowsFirefoxExe(browserApp);
    await runPowerShellScript(
      `Start-Process -FilePath "${escapeForPowerShell(exe)}" -ArgumentList "${escapeForPowerShell(tab.url)}"`,
    );
    return;
  }

  // Instead of trying to find and activate the existing tab,
  // just open the URL which is more reliable and simpler
  const command = `open -a "${browserApp}" "${tab.url}"`;
  await execAsync(command);
}
