import SwiftUI
import UIKit
import ContoursAI_SDK

class ViewModel: ObservableObject {
    @Published var captureSide = DocumentSide.front.rawValue
}
struct ContentView: View {
    @State  var frontImage:UIImage?
    @State  var rearImage:UIImage?
    @State private var isPresentingVC = false
    @State private var isPresentingRearVC = false
    var viewModel: ViewModel = ViewModel()
    
    @State var shouldPresent: Bool = false
    var body: some View {
        VStack {
            Text("Front Image")
            Image(uiImage: frontImage ?? UIImage())
                .resizable()
                .aspectRatio(contentMode: .fit)
                .padding()
                .background(Color.gray)
                .onTapGesture {
                    ContoursAIFramework.shared.isLandscape = true
                    viewModel.captureSide  = DocumentSide.front.rawValue
                    shouldPresent = true
                }
            Text("Rear Image")
            Image(uiImage: rearImage ?? UIImage())
                .resizable()
                .aspectRatio(contentMode: .fit)
                .padding()
                .background(Color.gray)
                .onTapGesture {
                    ContoursAIFramework.shared.isLandscape = true
                    viewModel.captureSide = DocumentSide.back.rawValue
                    shouldPresent = true
                }
        }
        .fullScreenCover(isPresented: $shouldPresent) {
            ContoursSDK(captureSide:  viewModel.captureSide , frontImage: $frontImage, rearImage: $rearImage).ignoresSafeArea(.all)
        }
    }
}

struct Present_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
