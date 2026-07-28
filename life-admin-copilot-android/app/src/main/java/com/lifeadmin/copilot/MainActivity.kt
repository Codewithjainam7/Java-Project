package com.lifeadmin.copilot

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import com.lifeadmin.copilot.service.CopilotForegroundService

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        requestRequiredPermissions()

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainCopilotScreen(
                        onStartService = { startCopilotService() },
                        onStopService = { stopCopilotService() }
                    )
                }
            }
        }
    }

    private fun requestRequiredPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS,
            Manifest.permission.RECORD_AUDIO
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        ActivityCompat.requestPermissions(this, permissions.toTypedArray(), 101)
    }

    private fun startCopilotService() {
        val intent = Intent(this, CopilotForegroundService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    private fun stopCopilotService() {
        val intent = Intent(this, CopilotForegroundService::class.java)
        stopService(intent)
    }
}

@Composable
fun MainCopilotScreen(onStartService: () -> Unit, onStopService: () -> Unit) {
    var isServiceActive by remember { mutableStateOf(true) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "ANDROID AUTOMATED ASSISTANT LAYER",
            style = MaterialTheme.typography.titleLarge
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Foreground Service status: ${if (isServiceActive) "ACTIVE" else "STOPPED"}",
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = {
                if (isServiceActive) {
                    onStopService()
                } else {
                    onStartService()
                }
                isServiceActive = !isServiceActive
            }
        ) {
            Text(if (isServiceActive) "PAUSE FOREGROUND SERVICE" else "START FOREGROUND SERVICE")
        }
    }
}
