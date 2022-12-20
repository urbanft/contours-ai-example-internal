//
//  ViewController.swift
//  ContoursAIExampleiOS
//
//  Created by UrbanFT on 19/12/22.
//

import UIKit
import ContoursAI_SDK

class ViewController: UIViewController, CheckCaptureDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()
        openContoursAISDK()
    }
    
    func openContoursAISDK() {
      let contoursSDK = ContoursAIFramework()
      let controller = contoursSDK.getInitialScreen(checkCapturingSide: .front, clientId: "<YOUR CLIENT ID>", captureType: CaptureType.both.rawValue, controller: self)
      self.navigationController?.pushViewController(controller, animated: false)
    }
    
    func imageCaptured(frontImageCropped: UIImage?, rearImageCropped: UIImage?, frontImage: UIImage?, rearImage: UIImage?) {
        if frontImage != nil {
            //Your code goes here
        }
        if rearImage != nil {
            //Your code goes here
        }
    }
}

