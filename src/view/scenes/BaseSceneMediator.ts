import { Mediator } from '@rollinsafary/mvc';
import Game from '../../Game';
import GameFacade from '../../GameFacade';
import { getScene, postRunnable } from '../utils/phaser/PhaserUtils';
import BaseScene from './BaseScene';
import PopupScene from './PopupScene';
import ServiceScene from './ServiceScene';

export default abstract class BaseSceneMediator<
  T extends BaseScene
> extends Mediator<T> {
  protected defaultNotifications: string[] = [
    PopupScene.WAKE_NOTIFICATION,
    PopupScene.SLEEP_NOTIFICATION,
  ];

  constructor(name: string, viewComponent: T) {
    super(name, viewComponent);

    if (this.viewComponent) {
      this.registerEvents();
    }
  }

  public handleNotification(notificationName: string, ...args: any[]): void {
    this.handleDefaultNotifications(notificationName);
  }

  public setViewComponent(viewComponent: T): void {
    super.setViewComponent(viewComponent);
    this.setViewComponentListeners();
    this.registerEvents();
  }

  public onRegister(): void {
    this.setView();
    this.subscribeToDefaultNotifications();
    super.onRegister();
  }

  public onRemove(): void {
    this.sceneManager.remove(this.viewComponent.constructor.name);
    super.onRemove();
  }

  protected async startScene(): Promise<void> {
    return new Promise<void>(
      (resolve: (value?: void | PromiseLike<void>) => void) => {
        if (this.sceneManager.isActive(this.viewComponent.constructor.name)) {
          return;
        }
        postRunnable(() => {
          this.sceneManager.start(this.viewComponent.constructor.name);
          resolve();
        });
      },
    );
  }

  protected async stopScene(): Promise<void> {
    this.sceneManager.stop(this.viewComponent.constructor.name);
  }

  protected setView(): void {
    //
  }

  protected setViewComponentListeners(): void {
    //
  }

  protected registerEvents(): void {}

  protected async fadeScreenOut(
    color: number = 0x0000000,
    duration: number = 500,
    delay: number = 0,
    wait: boolean = false,
  ): Promise<void> {
    const serviceScene: ServiceScene = getScene(ServiceScene.NAME);
    this.sceneManager.bringToTop(serviceScene);
    wait && (await serviceScene.fadeInPromise);
    return serviceScene.screenFadeOut(color, duration, delay);
  }
  protected async fadeScreenIn(
    duration: number = 300,
    delay: number = 0,
    wait: boolean = false,
  ): Promise<void> {
    const serviceScene: ServiceScene = getScene(ServiceScene.NAME);
    this.sceneManager.bringToTop(serviceScene);
    wait && (await serviceScene.fadeOutPromise);
    return serviceScene.screenFadeIn(duration, delay);
  }

  protected subscribeToDefaultNotifications(): void {
    this.subscribeToNotifications(...this.defaultNotifications);
  }

  protected handleDefaultNotifications(
    notificationName: string,
    ...args: any
  ): void {
    switch (notificationName) {
      case PopupScene.WAKE_NOTIFICATION:
        if (this.sceneManager.isActive(this.viewComponent.constructor.name)) {
          this.viewComponent.input.enabled = false;
        }
        break;
      case PopupScene.SLEEP_NOTIFICATION:
        if (this.sceneManager.isActive(this.viewComponent.constructor.name)) {
          this.viewComponent.input.enabled = true;
        }
        break;
      default:
        break;
    }
  }

  protected onPlaySfx(sfxName: string, loop: boolean): void {
    this.sendNotification(BaseScene.PLAY_SFX_NOTIFICATION, sfxName, loop);
  }
  protected onStopSfx(): void {
    this.sendNotification(BaseScene.STOP_SFX_NOTIFICATION);
  }

  get game(): Game {
    return GameFacade.game as Game;
  }

  get sceneManager(): Phaser.Scenes.SceneManager {
    return this.game.scene;
  }
}
