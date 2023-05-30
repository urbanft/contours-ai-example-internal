package com.contoursai.android.example

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import com.contourdocumentimaging.android.contours_ai.ContoursStarterActivity
import com.contourdocumentimaging.android.contours_ai.callback.IContoursResultListener
import com.contourdocumentimaging.android.contours_ai.constants.ContoursConstants
import com.contourdocumentimaging.android.contours_ai.models.ContoursCapturingMode
import com.contourdocumentimaging.android.contours_ai.models.ContoursModel
import com.contourdocumentimaging.android.contours_ai.models.ContoursResultModel
import java.net.URI
import java.net.URISyntaxException

class MainActivity : AppCompatActivity() {

    private var ivFront: ImageView? = null
    private var ivBack: ImageView? = null
    private var tvFront: TextView? = null
    private var tvBack: TextView? = null
    private var bitmapFront: Bitmap? = null
    private var bitmapBack: Bitmap? = null
    private var imageName: String? = null

    // Check face controls the capture of front or back check face.
    // It's important to set it correctly because that affects different
    // stages and thresholds of metrics for the process.
    private var checkFace = ContoursConstants.FRONT_FACE
    private val clientId = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        tvFront = findViewById<View>(R.id.tvFront) as TextView
        tvBack = findViewById<View>(R.id.tvBack) as TextView
        ivFront = findViewById<View>(R.id.ivFront) as ImageView
        ivBack = findViewById<View>(R.id.ivBack) as ImageView
        ivFront!!.setOnClickListener { openContours(true) }
        ivBack!!.setOnClickListener { openContours(false) }
    }

    /**
     *
     * @param isFront
     */
    private fun openContours(isFront: Boolean) {
        checkFace = if (isFront) {
            ContoursConstants.FRONT_FACE
        } else {
            ContoursConstants.BACK_FACE
        }
        takePicture()
    }

    private fun takePicture() {
        val contoursModel = ContoursModel()
        contoursModel.capturingMode = ContoursCapturingMode.BOTH_CAPTURE
        contoursModel.checkFace = checkFace
        contoursModel.fontFamily = "Poppins"
        contoursModel.enableMultipleCheckCapturing = false
        ContoursStarterActivity.launchSdk(this, contoursModel, clientId, object:
            IContoursResultListener {
            override fun onCaptureSuccess(contoursResultModel: ContoursResultModel) {
                if (contoursResultModel.resultCheckFace.equals(ContoursConstants.FRONT_FACE, ignoreCase = true)) {
                    /*val frontCroppedImageUri = contoursResultModel.resultFrontCroppedImageUri
                    val rearCroppedImageUri = contoursResultModel.resultRearCroppedImageUri
                    val frontImageUri = contoursResultModel.resultFrontImageUri
                    val rearImageUri = contoursResultModel.resultRearImageUri*/
                    showCapturedImage(contoursResultModel.resultFrontCroppedImageUri, ivFront, tvFront, true)
                    showCapturedImage(contoursResultModel.resultRearCroppedImageUri, ivBack, tvBack, false)
                } else if (contoursResultModel.resultCheckFace.equals(ContoursConstants.BACK_FACE, ignoreCase = true)) {
                    /*val rearCroppedImageUri = contoursResultModel.resultRearCroppedImageUri
                    val rearImageUri = contoursResultModel.resultRearImageUri*/
                    showCapturedImage(contoursResultModel.resultRearCroppedImageUri, ivBack, tvBack, false)
                }
            }

            override fun onEventCapture(eventJsonString: String) {
                  print(eventJsonString)
            }
        })
    }

    private fun showCapturedImage(imageUri: String?, imageView: ImageView?, textView: TextView?, isFront: Boolean) {
        if (imageUri == null) {
            return
        }
        try {
            val backURI = URI(imageUri)
            val options = BitmapFactory.Options()
            val bmp = BitmapFactory.decodeFile(backURI.path, options)
            if (bmp != null) {
                if (isFront) {
                    bitmapFront = bmp
                } else {
                    bitmapBack = bmp
                }
                imageView!!.setImageBitmap(bmp)
                textView!!.visibility = View.GONE
            }
        } catch (e: URISyntaxException) {
            e.printStackTrace()
        }
    }
}