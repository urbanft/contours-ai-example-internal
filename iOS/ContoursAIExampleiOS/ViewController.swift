//
//  ViewController.swift
//  ContoursAIExampleiOS
//
//  Created by UrbanFT on 19/12/22.
//

import UIKit
import ContoursAI_SDK


class ViewController: UIViewController,CheckCaptureDelegate{
    
    @IBOutlet var frontImageView : UIImageView!
    @IBOutlet var backImageView : UIImageView!
    @IBOutlet var frontImagebutton : UIButton!
    @IBOutlet var backImagebutton : UIButton!
    
    let appDelegate = UIApplication.shared.delegate as? AppDelegate
    let contoursSDK = ContoursAIFramework()
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        self.navigationController?.navigationBar.isHidden = true
    }
    @IBAction func confirmButtonClicked(_ sender: Any) {
        let button =  sender as? UIButton
        openContoursSDKConcept(checkSide: button?.tag ?? 0)  //Function to  open Contours SDK
    }
    
    func openContoursSDKConcept(checkSide:Int) {
        appDelegate?.isLandscape = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2, execute: {
            self.view.layoutSubviews()
            switch checkSide {
            case 101:
                self.openFrontOfCheck()
            case 102:
                self.openRearOfCheck()
            default : break
            }
        })
    }
    
    func openFrontOfCheck(){
        let imageVC = contoursSDK.initializeSDK(checkCapturingSide:.front ,clientId: "<YOUR CLIENT ID>", captureType: CaptureType.both.rawValue,  enableMultipleCheckCapturing: false ,delegate: self)
        self.navigationController?.pushViewController(imageVC, animated: false)
    }
    
    func openRearOfCheck() {
        let imageVC = contoursSDK.initializeSDK(checkCapturingSide: .back, clientId: "<YOUR CLIENT ID>", captureType: CaptureType.both.rawValue, enableMultipleCheckCapturing: false, delegate: self)
        self.navigationController?.pushViewController(imageVC, animated: false)
    }
    
    func imageCaptured(frontImageCropped: UIImage?, rearImageCropped: UIImage?, frontImage: UIImage?, rearImage: UIImage?) {
        if frontImage != nil {
            frontImageView.image = frontImageCropped
        }
        if rearImage != nil {
            backImageView.image = rearImageCropped
        }
        appDelegate?.isLandscape = false
    }
    
    func onContourClose() {
        appDelegate?.isLandscape = false
    }
    
    func eventCaptured(data: [String : Any]?) {
    }
}
