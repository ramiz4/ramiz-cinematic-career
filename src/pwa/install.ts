export const IOS_INSTALL_DISMISS_KEY = 'ramiz-ios-install-prompt-v1';
export const IOS_INSTALL_PROMPT_DELAY = 6_000;

export type InstallEnvironment = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  standalone: boolean;
  displayModeStandalone: boolean;
  dismissed: boolean;
};

const alternativeIosBrowsers = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Ddg|GSA|YaBrowser|Brave|FocusiOS/i;

export function canOfferIosInstall(environment: InstallEnvironment) {
  const isiOS = /iPad|iPhone|iPod/i.test(environment.userAgent)
    || (environment.platform === 'MacIntel' && environment.maxTouchPoints > 1);
  const isSafari = /WebKit/i.test(environment.userAgent)
    && /Version\//i.test(environment.userAgent)
    && /Safari/i.test(environment.userAgent)
    && !alternativeIosBrowsers.test(environment.userAgent);

  return isiOS
    && isSafari
    && !environment.standalone
    && !environment.displayModeStandalone
    && !environment.dismissed;
}
