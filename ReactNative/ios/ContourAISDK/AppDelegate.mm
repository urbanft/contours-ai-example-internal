#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <ContoursAI_SDK/ContoursAI_SDK-Swift.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
   RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                    moduleName:@"ContourAISDK"
                                             initialProperties:nil];

   self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
   UIViewController *rootViewController = [UIViewController new];
   UINavigationController *navController = [[UINavigationController alloc]initWithRootViewController:rootViewController];
   rootViewController.view = rootView ;
   self.window.rootViewController = navController;
   [self.window makeKeyAndVisible];
   return YES;
}
-(NSUInteger)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window
{
  if ([ContoursAIFramework shared].isLandscape ) {
    return UIInterfaceOrientationMaskLandscapeRight;
  } else {
    return UIInterfaceOrientationMaskPortrait;
  }// you can change orientation for specific type . for ex landscape left
}
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
