package admob.plugin.ads;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.reward.RewardedVideoAdListener;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewarded.RewardedAdCallback;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONException;
import org.json.JSONObject;

import admob.plugin.Action;
import admob.plugin.Events;

public class RewardedVideoAd extends AdBase {
    private com.google.android.gms.ads.rewarded.RewardedAd rewardedAd = null;

    RewardedVideoAd(int id, String adUnitID) {
        super(id, adUnitID);
    }

    public static boolean executeIsReadyAction(Action action, CallbackContext callbackContext) {
        plugin.cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                RewardedVideoAd rewardedVideoAd = (RewardedVideoAd) action.getAd();

                PluginResult result = new PluginResult(PluginResult.Status.OK, rewardedVideoAd != null && rewardedVideoAd.isReady());
                callbackContext.sendPluginResult(result);
            }
        });

        return true;
    }

    public static boolean executeLoadAction(Action action, CallbackContext callbackContext) {
        plugin.cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                RewardedVideoAd rewardedVideoAd = (RewardedVideoAd) action.getAd();
                if (rewardedVideoAd == null) {
                    rewardedVideoAd = new RewardedVideoAd(action.optId(), action.getAdUnitID());
                }
                rewardedVideoAd.createAndLoad(action.buildAdRequest());

                PluginResult result = new PluginResult(PluginResult.Status.OK, "");
                callbackContext.sendPluginResult(result);
            }
        });

        return true;
    }

    public static boolean executeShowAction(Action action, CallbackContext callbackContext) {
        plugin.cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                RewardedVideoAd rewardedVideoAd = (RewardedVideoAd) action.getAd();
                if (rewardedVideoAd != null) {
                    rewardedVideoAd.show();
                }

                PluginResult result = new PluginResult(PluginResult.Status.OK, "");
                callbackContext.sendPluginResult(result);
            }
        });

        return true;
    }

    @Override
    public void destroy() {
        clear();

        super.destroy();
    }

    @Override
    String getLoadedEvent() {
        return Events.REWARD_VIDEO_LOAD;
    }

    @Override
    String getFailedToLoadEvent() {
        return Events.REWARD_VIDEO_LOAD_FAIL;
    }

    @Override
    String getOpenedEvent() {
        return Events.REWARD_VIDEO_OPEN;
    }

    @Override
    String getClosedEvent() {
        return Events.REWARD_VIDEO_CLOSE;
    }

    @Override
    String getLeftApplicationEvent() {
        return Events.REWARD_VIDEO_EXIT_APP;
    }

    private void createAndLoad(AdRequest adRequest) {
        clear();
//        rewardedAd = new com.google.android.gms.ads.rewarded.RewardedAd(plugin.cordova.getActivity(), "ca-app-pub-6216306886113201/6700301189");
        System.out.println("--asd-asd-a-sd-asd-as-d-asd-as-da-");
        rewardedAd = new com.google.android.gms.ads.rewarded.RewardedAd(plugin.cordova.getActivity(), "ca-app-pub-9858315875430463/9053155876");
//        rewardedVideoAd = MobileAds.getRewardedVideoAdInstance(plugin.cordova.getActivity());
        RewardedAdLoadCallback adLoadCallback = new RewardedAdLoadCallback(){
            @Override
            public void onRewardedAdLoaded() {
                plugin.emit(getLoadedEvent());
            }

//            @Override
//            public void onRewardedVideoStarted() {
//                plugin.emit(Events.REWARD_VIDEO_START);
//            }
//
//            @Override
//            public void onRewarded(RewardItem rewardItem) {
//                plugin.emit(Events.REWARD_VIDEO_REWARD);
//            }
//
//            @Override
//            public void onRewardedVideoAdLeftApplication() {
//                plugin.emit(getLeftApplicationEvent());
//            }

            @Override
            public void onRewardedAdFailedToLoad(int errorCode) {
                plugin.emit(getFailedToLoadEvent(), buildErrorPayload(errorCode));
            }

//            @Override
//            public void onRewardedVideoCompleted() {
//                plugin.emit(Events.REWARD_VIDEO_COMPLETE);
//            }
        };
//        rewardedVideoAd.setRewardedVideoAdListener(new RewardedVideoAdListener() {
//
//        });
        rewardedAd.loadAd(adRequest, adLoadCallback);
    }

    private boolean isReady() {
        return rewardedAd != null && rewardedAd.isLoaded();
    }

    private void show() {
        if (isReady()) {
            RewardedAdCallback adCallback = new RewardedAdCallback() {
                @Override
                public void onRewardedAdOpened() {
                    plugin.emit(Events.REWARD_VIDEO_OPEN);
                }

                @Override
                public void onRewardedAdClosed() {
                    plugin.emit(Events.REWARD_VIDEO_CLOSE);
                }

                @Override
                public void onUserEarnedReward(@NonNull RewardItem reward){
                    plugin.emit(Events.REWARD_VIDEO_REWARD);
                }

                @Override
                public void onRewardedAdFailedToShow(int errorCode) {
                    plugin.emit(Events.REWARD_VIDEO_SHOW_FAIL);
                    System.out.println("rewarded show fail");
                    System.out.println(errorCode);
                    // Ad failed to display.
                }
            };
            rewardedAd.show(plugin.cordova.getActivity(), adCallback);
        }
    }

    private void clear() {
        if (rewardedAd != null) {
//            rewardedAd.setRewardedVideoAdListener(null);
            rewardedAd = null;
        }
    }
}
