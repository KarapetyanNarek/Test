import GameFacade from '../../GameFacade';
import BaseSceneMediator from './BaseSceneMediator';
import BootScene from './BootScene';

export default class BootSceneMediator extends BaseSceneMediator<BootScene> {
  public static NAME: string = 'BootSceneMediator';

  constructor() {
    super(BootSceneMediator.NAME, null);
  }

  public registerNotificationInterests(): void {
    this.subscribeToNotifications(GameFacade.STARTUP_NOTIFICATION);
  }

  public handleNotification(notificationName: string): void {
    this.handleDefaultNotifications(notificationName);
    switch (notificationName) {
      case GameFacade.STARTUP_NOTIFICATION:
        this.startScene();
        break;
      default:
        console.warn(`${notificationName} is unhandled!`);
        break;
    }
  }

  protected setView(): void {
    const bootScene: BootScene = new BootScene();
    this.sceneManager.add(BootScene.NAME, bootScene);
    this.setViewComponent(bootScene);
  }

  protected setViewComponentListeners(): void {
    super.setViewComponentListeners();
    this.viewComponent.events.on(
      BootScene.LOAD_COMPLETE_EVENT,
      this.onLoadComplete,
      this,
    );
  }

  private async onLoadComplete(): Promise<void> {
    this.sceneManager.stop(BootScene.NAME);
    this.sceneManager.remove(BootScene.NAME);
    this.facade.sendNotification(BootScene.LOAD_COMPLETE_NOTIFICATION);
  }
}
