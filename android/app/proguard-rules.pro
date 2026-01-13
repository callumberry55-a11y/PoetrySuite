-keep class com.getcapacitor.** { *; }
-keep class androidx.** { *; }
-keep class kotlin.** { *; }
-keep class com.poetrysuite.** { *; }

# Supabase
-keep class com.supabase.** { *; }
-keep class io.gotev.** { *; }

# Preserve line numbers for debugging
-keepattributes SourceFile,LineNumberTable

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
