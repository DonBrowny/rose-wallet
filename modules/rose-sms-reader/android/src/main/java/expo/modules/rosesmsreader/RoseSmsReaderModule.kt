package expo.modules.rosesmsreader

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.database.Cursor
import android.provider.Telephony
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.*
private const val SMS_PERMISSION_REQUEST_CODE = 1001

class RoseSmsReaderModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('RoseSmsReader')` in JavaScript.
    Name("RoseSmsReader")

    // Check if SMS reading is available on this device
    AsyncFunction("isAvailable") { promise: Promise ->
      try {
        val context =
                appContext.reactContext
                        ?: return@AsyncFunction promise.reject(
                                "NO_CONTEXT",
                                "React context not available",
                                null
                        )

        val hasSmsPermission =
                ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) ==
                        PackageManager.PERMISSION_GRANTED
        promise.resolve(hasSmsPermission)
      } catch (e: Exception) {
        promise.reject("ERROR", "Failed to check SMS availability: ${e.message}", e)
      }
    }

    // Check SMS permission status
    AsyncFunction("checkSMSPermission") { promise: Promise ->
      try {
        val context =
                appContext.reactContext
                        ?: return@AsyncFunction promise.reject(
                                "NO_CONTEXT",
                                "React context not available",
                                null
                        )
        val hasPermission =
                ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) ==
                        PackageManager.PERMISSION_GRANTED

        val result =
                mapOf(
                        "granted" to hasPermission,
                        "canAskAgain" to true,
                        "message" to
                                if (hasPermission) "SMS permission is granted"
                                else "SMS permission is not granted"
                )
        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject("ERROR", "Failed to check SMS permission: ${e.message}", e)
      }
    }

    // Request SMS permission
    AsyncFunction("requestSMSPermission") { promise: Promise ->
      try {
        val context =
                appContext.reactContext
                        ?: return@AsyncFunction promise.reject(
                                "NO_CONTEXT",
                                "React context not available",
                                null
                        )

        // Check if permission is already granted
        val hasPermission =
                ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) ==
                        PackageManager.PERMISSION_GRANTED

        if (hasPermission) {
          val result =
                  mapOf(
                          "granted" to true,
                          "canAskAgain" to true,
                          "message" to "SMS permission already granted"
                  )
          promise.resolve(result)
          return@AsyncFunction
        }

        // Request permission if not granted
        val activity = appContext.currentActivity
        if (activity != null) {
          ActivityCompat.requestPermissions(
                  activity,
                  arrayOf(Manifest.permission.READ_SMS),
                  SMS_PERMISSION_REQUEST_CODE
          )

          // Return that permission was requested
          val result =
                  mapOf(
                          "granted" to false,
                          "canAskAgain" to true,
                          "message" to "SMS permission request sent to user"
                  )
          promise.resolve(result)
        } else {
          val result =
                  mapOf(
                          "granted" to false,
                          "canAskAgain" to false,
                          "message" to "Cannot request permission: no activity available"
                  )
          promise.resolve(result)
        }
      } catch (e: Exception) {
        promise.reject("ERROR", "Failed to request SMS permission: ${e.message}", e)
      }
    }

    // Read SMS messages
    AsyncFunction("readSMS") { options: Map<String, Any>, promise: Promise ->
      try {
        val context =
                appContext.reactContext
                        ?: return@AsyncFunction promise.reject(
                                "NO_CONTEXT",
                                "React context not available",
                                null
                        )

        // Check permission
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) !=
                        PackageManager.PERMISSION_GRANTED
        ) {
          promise.reject("PERMISSION_DENIED", "SMS permission not granted", null)
          return@AsyncFunction
        }

        val startTimestamp = (options["startTimestamp"] as? Double)?.toLong()
        val endTimestamp = (options["endTimestamp"] as? Double)?.toLong()
        val senderNumbers = options["senderNumbers"] as? List<String> ?: emptyList()
        val includeRead = options["includeRead"] as? Boolean ?: true

        if (startTimestamp == null || endTimestamp == null) {
          promise.reject("INVALID_PARAMS", "startTimestamp and endTimestamp are required", null)
          return@AsyncFunction
        }

        android.util.Log.d(
                "RoseSmsReader",
                "Reading SMS messages: startTimestamp=$startTimestamp, endTimestamp=$endTimestamp, senderNumbers=$senderNumbers, includeRead=$includeRead"
        )

        val messages = readSMSMessages(context, startTimestamp, endTimestamp, senderNumbers, includeRead)

        android.util.Log.d("RoseSmsReader", "Found ${messages.size} SMS messages")

        promise.resolve(mapOf("messages" to messages))
      } catch (e: Exception) {
        android.util.Log.e("RoseSmsReader", "Error reading SMS messages", e)
        promise.reject("ERROR", "Failed to read SMS messages: ${e.message}", e)
      }
    }
  }

    private fun readSMSMessages(
          context: Context,
          startTimestamp: Long,
          endTimestamp: Long,
          senderNumbers: List<String>,
          includeRead: Boolean
  ): List<Map<String, Any>> {
    val messages = mutableListOf<Map<String, Any>>()

    val uri = Telephony.Sms.CONTENT_URI
    val projection =
            arrayOf(
                    Telephony.Sms._ID,
                    Telephony.Sms.ADDRESS,
                    Telephony.Sms.BODY,
                    Telephony.Sms.DATE,
                    Telephony.Sms.READ,
                    Telephony.Sms.TYPE
            )

    // Build selection for inbox messages only with date range
    val selection = if (includeRead) {
      "${Telephony.Sms.DATE} >= ? AND ${Telephony.Sms.DATE} <= ? AND ${Telephony.Sms.TYPE} = 1"
    } else {
      "${Telephony.Sms.DATE} >= ? AND ${Telephony.Sms.DATE} <= ? AND ${Telephony.Sms.READ} = 0 AND ${Telephony.Sms.TYPE} = 1"
    }

    val selectionArgs = arrayOf(startTimestamp.toString(), endTimestamp.toString())

    android.util.Log.d(
            "RoseSmsReader",
            "Querying SMS with URI: $uri, selection: $selection, args: ${selectionArgs.contentToString()}"
    )

    val cursor: Cursor? =
            try {
              context.contentResolver.query(
                      uri,
                      projection,
                      selection,
                      selectionArgs,
                      "${Telephony.Sms.DATE} DESC"
              )
            } catch (e: SecurityException) {
              android.util.Log.e("RoseSmsReader", "SecurityException: ${e.message}")
              null
            } catch (e: Exception) {
              android.util.Log.e("RoseSmsReader", "Query exception: ${e.message}")
              null
            }

    android.util.Log.d(
            "RoseSmsReader",
            "Cursor result: ${if (cursor != null) "success" else "null"}"
    )

    cursor?.use { c ->
      android.util.Log.d("RoseSmsReader", "Cursor has ${c.count} rows")

      try {
        val idIndex = c.getColumnIndexOrThrow(Telephony.Sms._ID)
        val addressIndex = c.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
        val bodyIndex = c.getColumnIndexOrThrow(Telephony.Sms.BODY)
        val dateIndex = c.getColumnIndexOrThrow(Telephony.Sms.DATE)
        val readIndex = c.getColumnIndexOrThrow(Telephony.Sms.READ)
        val typeIndex = c.getColumnIndexOrThrow(Telephony.Sms.TYPE)

        while (c.moveToNext()) {
          val address = c.getString(addressIndex)
          val messageType = c.getInt(typeIndex)
          val body = c.getString(bodyIndex)

          // Filter by sender numbers if provided
          if (senderNumbers.isNotEmpty() &&
                          !senderNumbers.any { address.contains(it, ignoreCase = true) }
          ) {
            continue
          }

          // For expense tracking, we're interested in both incoming and outgoing messages
          // but we can filter by type if needed (1 = Inbox, 2 = Sent)
          val message =
                  mapOf(
                          "id" to c.getString(idIndex),
                          "address" to address,
                          "body" to body,
                          "date" to c.getLong(dateIndex),
                          "read" to (c.getInt(readIndex) == 1),
                          "type" to messageType
                  )
          messages.add(message)
        }
      } catch (e: Exception) {
        android.util.Log.e("RoseSmsReader", "Error processing cursor", e)
      }
    }

    return messages
  }
}
