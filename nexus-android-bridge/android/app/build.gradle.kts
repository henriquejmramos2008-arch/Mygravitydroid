plugins { id("com.android.application") }
android {
  namespace = "pt.nexus.bridge"
  compileSdk = 35
  defaultConfig {
    applicationId = "pt.nexus.bridge"
    minSdk = 28
    targetSdk = 28
    versionCode = 1
    versionName = "0.1.0"
  }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
}
