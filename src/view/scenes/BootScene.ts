import BaseScene from './BaseScene';

export default class BootScene extends BaseScene {
  public static NAME: string = 'BootScene';
  public static LOAD_COMPLETE_NOTIFICATION: string = `${BootScene.NAME}LoadCompleteNotification`;
  public static LOAD_COMPLETE_EVENT: string = `${BootScene.NAME}LoadCompleteEvent`;

  constructor() {
    super(BootScene.NAME);
  }

  public init(): void {
    super.init();
  }

  public preload(): void {}

  public create(): void {
    this.i18n.init('en');
    this.events.emit(BootScene.LOAD_COMPLETE_EVENT);
  }
}
