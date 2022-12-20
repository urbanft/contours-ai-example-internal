package com.contoursai.android.example

import android.graphics.BitmapFactory
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import com.urbanft.android.contours_ai.ContoursStarterActivity
import com.urbanft.android.contours_ai.constants.ContoursConstants
import com.urbanft.android.contours_ai.models.ContoursCapturingMode
import com.urbanft.android.contours_ai.models.ContoursModel
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
        ContoursStarterActivity.launchSdk(this, contoursStarterActivityResultLauncher, contoursModel,  "<YOUR CLIENT ID>")
    }


    var contoursStarterActivityResultLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result: ActivityResult ->
        if (result.resultCode == RESULT_OK) {
            if (result.data == null) {
                return@registerForActivityResult
            }
            val face = result.data!!.getStringExtra(ContoursConstants.RESULT_FACE_KEY)
            if (face.equals(ContoursConstants.FRONT_FACE, ignoreCase = true)) {
                val frontCroppedImageUri = result.data?.getStringExtra(ContoursConstants.RESULT_FRONT_CROPPED_IMAGE_URI)
                val rearCroppedImageUri = result.data?.getStringExtra(ContoursConstants.RESULT_REAR_CROPPED_IMAGE_URI)
                val frontImageUri = result.data?.getStringExtra(ContoursConstants.RESULT_FRONT_IMAGE_URI)
                val rearImageUri = result.data?.getStringExtra(ContoursConstants.RESULT_REAR_IMAGE_URI)
                showCapturedImage(<IMAGE_URI>)
            } else if (face.equals(ContoursConstants.BACK_FACE, ignoreCase = true)) {
                val rearCroppedImageUri = result.data?.getStringExtra(ContoursConstants.RESULT_REAR_CROPPED_IMAGE_URI)
                val rearImageUri = result.data?.getStringExtra(ContoursConstants.RESULT_REAR_IMAGE_URI)
                showCapturedImage(<IMAGE_URI>)
            }
        }
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