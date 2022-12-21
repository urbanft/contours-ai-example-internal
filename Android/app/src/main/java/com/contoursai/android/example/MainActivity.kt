package com.contoursai.android.example

import android.graphics.BitmapFactory
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import java.net.URI
import java.net.URISyntaxException

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        takePicture()
    }

    private fun takePicture() {
        val contoursModel = ContoursModel()
        contoursModel.capturingMode = ContoursCapturingMode.BOTH_CAPTURE
        contoursModel.checkFace = ContoursConstants.FRONT_FACE
        contoursModel.fontFamily = "Poppins"
        ContoursStarterActivity.launchSdk(this, contoursModel, clientId, object: IContoursResultListener{
            override fun onCaptureSuccess(contoursResultModel: ContoursResultModel) {
                if (contoursResultModel.resultCheckFace.equals(ContoursConstants.FRONT_FACE, ignoreCase = true)) {
                    val frontCroppedImageUri = contoursResultModel.resultFrontCroppedImageUri
                    val rearCroppedImageUri = contoursResultModel.resultRearCroppedImageUri
                    val frontImageUri = contoursResultModel.resultFrontImageUri
                    val rearImageUri = contoursResultModel.resultRearImageUri
                    showCapturedImage(<IMAGE_URI>)
                } else if (contoursResultModel.resultCheckFace.equals(ContoursConstants.BACK_FACE, ignoreCase = true)) {
                    val rearCroppedImageUri = contoursResultModel.resultRearCroppedImageUri
                    val rearImageUri = contoursResultModel.resultRearImageUri
                    showCapturedImage(<IMAGE_URI>)
                }
            }
        })
    }

    private fun showCapturedImage(imageUri: String?) {
        if (imageUri == null) {
            return
        }
        try {
            val uri = URI(imageUri)
            val options = BitmapFactory.Options()
            val bmp = BitmapFactory.decodeFile(uri.path, options)
            if (bmp != null) {
                //Set bitmap on the ImageView
            }
        } catch (e: URISyntaxException) {
            e.printStackTrace()
        }
    }
}