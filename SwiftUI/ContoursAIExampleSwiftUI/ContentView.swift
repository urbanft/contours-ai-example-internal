import SwiftUI
import UIKit
import ContoursAI_SDK

struct ContentView: View {
    @State var selection: String?
    @State private var orientation = UIDevice.current.orientation
    @State  var frontImage:UIImage?
    @State  var rearImage:UIImage?
    @State  var fromtImageObj:Image?
    @State  var rearImageObj:Image?
    var body: some View {
        NavigationView {
            VStack(spacing: 10.0) {
                Text("Front Image")
                NavigationLink(destination: ContoursSDK(captureSide: .front, frontImage: $frontImage, rearImage: $rearImage).ignoresSafeArea(.all)) {
                    fromtImageObj?
                        .resizable()
                        .background(Color.gray)
                        .aspectRatio(nil, contentMode: .fit)
                }.onAppear(){
                    loadimage()
                }
                Text("Rear Image ")
                NavigationLink(destination: ContoursSDK(captureSide: .back, frontImage: $frontImage, rearImage: $rearImage).ignoresSafeArea(.all)) {
                    rearImageObj?
                        .resizable()
                        .background(Color.gray)
                        .aspectRatio(nil, contentMode: .fit)
                }.onAppear(){
                    loadimage()
                }
            }
        }.edgesIgnoringSafeArea(.all)
            .navigationViewStyle(StackNavigationViewStyle())
        
    }
    func loadimage() {
        rearImageObj = Image(uiImage: rearImage ?? UIImage())
        fromtImageObj = Image(uiImage: frontImage ?? UIImage())
    }
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

