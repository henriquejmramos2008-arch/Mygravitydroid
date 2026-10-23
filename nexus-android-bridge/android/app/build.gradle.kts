plugins { id("com.android.application") }
android {
  namespace = "pt.nexus.bridge"
  compileSdk = 35
  buildFeatures { buildConfig = true }
  defaultConfig {
    applicationId = "pt.nexus.bridge"
    minSdk = 28
    targetSdk = 28
    versionCode = 2
    versionName = "0.2.0"
  }
  buildTypes {
    getByName("debug") { applicationIdSuffix = ".usb" }
  }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
}
