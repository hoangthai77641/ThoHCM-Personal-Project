# Flutter Wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-keep class com.google.firebase.messaging.** { *; }
-keep class com.google.firebase.auth.** { *; }
-keep class com.google.firebase.firestore.** { *; }
-keep class com.google.firebase.analytics.** { *; }

# Keep Firebase internal classes
-keepclassmembers class com.google.firebase.** {
    public *;
}

# Firebase messaging
-keepclassmembers class com.google.firebase.messaging.FirebaseMessagingService {
    public *;
}

# Firebase authentication
-keep class com.google.firebase.auth.FirebaseAuth
-keep class com.google.firebase.auth.FirebaseUser
-keep class com.google.firebase.auth.GetTokenResult
-keep class com.google.firebase.auth.AuthResult

# Firebase Firestore
-keep class com.google.firebase.firestore.FirebaseFirestore
-keep class com.google.firebase.firestore.DocumentSnapshot
-keep class com.google.firebase.firestore.QuerySnapshot

# OkHttp (used by HTTP requests)
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Gson (if used for JSON serialization)
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Don't warn about missing classes
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Keep the Application class and all classes extending it
-keep public class * extends android.app.Application

# Keep notification related classes
-keep class * extends android.app.Service
-keep class * extends android.content.BroadcastReceiver

# Keep any classes that might be accessed via reflection
-keepclassmembers class * {
    @com.google.firebase.firestore.PropertyName <methods>;
    @com.google.firebase.firestore.PropertyName <fields>;
}