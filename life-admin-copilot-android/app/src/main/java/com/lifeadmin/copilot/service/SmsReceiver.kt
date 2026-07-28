package com.lifeadmin.copilot.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val body = sms.messageBody
                val sender = sms.originatingAddress
                Log.d("CopilotSmsReceiver", "Captured SMS from $sender: $body")

                if (isBillLikeText(body)) {
                    Log.i("CopilotSmsReceiver", "Bill keyword detected. Queueing for API parse...")
                    // Forward text to backend /api/reminders/parse
                }
            }
        }
    }

    private fun isBillLikeText(text: String): Boolean {
        val lower = text.lowercase()
        val keywords = listOf("due", "bill", "pay", "amount", "rs", "$", "utility", "statement")
        return keywords.any { lower.contains(it) }
    }
}
