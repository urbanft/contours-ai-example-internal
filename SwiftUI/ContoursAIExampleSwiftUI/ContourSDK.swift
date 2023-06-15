//
//  ContoursSDK.swift
//  swiftUITest
//
//  Created by UrbanFT on 10/03/23.
//

import Foundation
import SwiftUI
import ContoursAI_SDK

struct ContoursSDK: UIViewControllerRepresentable {
    
    @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>
    var captureSide: CaptureSide? = .front
    @Binding  var frontImage: UIImage?
    @Binding  var rearImage: UIImage?
    
    /* contourSDK.initializeSDK is for initializing the Contour SDK.
     * Param checkCapturingSide - Check side(Front/Rear) which you want to capture.
     * Param clientId - Id Provide to you by the UrbanFT
     * Param captureType - With what type of capturing you want to start your Contour SDK Auto/Manual/Both
     * Param delegate - You Need to confirm delegate to get callback from Contour SDK
     */
    func makeUIViewController(context: Context) -> UIViewController {
        AppDelegate.orientationLock = .landscapeRight
        UIDevice.current.setValue(UIInterfaceOrientation.landscapeRight.rawValue, forKey: "orientation")
        let contourSDK = ContoursAIFramework()
        return contourSDK.initializeSDK(checkCapturingSide: captureSide ?? .front, clientId: "<YOUR CLIENT ID>", captureType: CaptureType.both.rawValue, enableMultipleCheckCapturing: false, delegate: ContourCallback(self))
    }
    
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
        // Update the view controller if needed
    }
    class ContourCallback: NSObject,CheckCaptureDelegate {
        let parent: ContoursSDK
        init(_ parent: ContoursSDK) {
            self.parent = parent
        }
        
        //Get callback when Contour SDK is close
        func onContourClose() {
            AppDelegate.orientationLock = .portrait
            UIDevice.current.setValue(UIInterfaceOrientation.portrait.rawValue, forKey: "orientation")
        }
        
        /* Get callback when check is captured.
         * Param frontImageCropped - Cropped front check Image without any border
         * Param rearImageCropped - Cropped rear check Image without any border
         * Param frontImage - Original front check image
         * Param rearImage - Original rear check image
         */
        func imageCaptured(frontImageCropped: UIImage?, rearImageCropped: UIImage?, frontImage: UIImage?, rearImage: UIImage?) {
            if let uiImage = frontImage {
                parent.frontImage = uiImage
            }
            if let uiImage = rearImage {
                parent.rearImage = uiImage
            }
            AppDelegate.orientationLock = .portrait
            UIDevice.current.setValue(UIInterfaceOrientation.portrait.rawValue, forKey: "orientation")
        }
    }
}

