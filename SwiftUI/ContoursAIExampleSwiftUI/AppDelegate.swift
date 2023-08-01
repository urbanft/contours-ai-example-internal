//
//  AppDelegate.swift
//  swiftUITest
//
//  Created by UrbanFT on 13/03/23.
//

import Foundation
import ContoursAI_SDK
import UIKit
class AppDelegate: NSObject, UIApplicationDelegate {
    
    //By default you want all your views to rotate freely
    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
        return ContoursAIFramework.shared.isLandscape ? .landscapeRight : .portrait
    }
}
