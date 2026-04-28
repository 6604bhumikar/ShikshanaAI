import React, { useEffect, useState, useRef } from "react";
import adminAPI from "../../lib/adminApi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import {
  Settings,
  Save,
  Mail,
  Phone,
  Globe,
  Palette,
  ShieldCheck,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Loader,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ======================
   DEFAULT SETTINGS (SAFE)
====================== */
const DEFAULT_SETTINGS = {
  siteName: "Shikshana LMS",
  tagline: "Empowering Education with Technology",
  supportEmail: "support@shikshana.in",
  contactNumber: "+91 98765 43210",
  websiteUrl: "https://shikshana.in",
  enableModeration: true,
  autoPayouts: false,
  darkTheme: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [initialSettings, setInitialSettings] = useState(null);
  const saveTimeoutRef = useRef(null);

  /* ======================
     LOAD SETTINGS
  ====================== */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await adminAPI.get("/settings");
        const loadedSettings = {
          ...DEFAULT_SETTINGS,
          ...(res.data.settings || {}),
        };
        
        setSettings(loadedSettings);
        setInitialSettings(loadedSettings);
      } catch (error) {
        console.error("Failed to load settings", error);
        setError("Failed to load platform settings. Using default values.");
        toast.error("Unable to load settings. Please try again.", {
          position: "top-center",
          autoClose: 4000,
          theme: "colored"
        });
        setSettings(DEFAULT_SETTINGS);
        setInitialSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /* ======================
     HANDLE CHANGE
  ====================== */
  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    
    // Clear success message when settings change
    if (success) setSuccess(false);
    
    // Show unsaved changes indicator after 2 seconds of inactivity
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (JSON.stringify(settings) !== JSON.stringify(initialSettings)) {
        setSuccess(false);
      }
    }, 2000);
  };

  /* ======================
     VALIDATE SETTINGS
  ====================== */
  const validateSettings = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (settings.supportEmail && !emailRegex.test(settings.supportEmail)) {
      toast.error("Please enter a valid support email address", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return false;
    }
    
    if (settings.websiteUrl && !urlRegex.test(settings.websiteUrl)) {
      toast.error("Please enter a valid website URL", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return false;
    }
    
    return true;
  };

  /* ======================
     SAVE SETTINGS
  ====================== */
  const handleSave = async () => {
    if (!validateSettings()) return;
    
    // Check if there are actual changes
    if (JSON.stringify(settings) === JSON.stringify(initialSettings)) {
      toast.info("No changes to save", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored"
      });
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Send only allowed keys
      await adminAPI.put("/settings", {
        siteName: settings.siteName,
        tagline: settings.tagline,
        supportEmail: settings.supportEmail,
        contactNumber: settings.contactNumber,
        websiteUrl: settings.websiteUrl,
        enableModeration: settings.enableModeration,
        autoPayouts: settings.autoPayouts,
        darkTheme: settings.darkTheme,
      });

      setInitialSettings(settings);
      setSuccess(true);
      
      toast.success("✅ Platform settings updated successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    } catch (error) {
      console.error("Failed to save settings", error);
      const message = error?.response?.data?.message || "Failed to update settings. Please try again.";
      setError(message);
      toast.error(message, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored"
      });
    } finally {
      setSaving(false);
    }
  };

  /* ======================
     RESET TO DEFAULTS
  ====================== */
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to default values? This cannot be undone.")) {
      setSettings(DEFAULT_SETTINGS);
      toast.info("Settings reset to default values", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored"
      });
    }
  };

  /* ======================
     SKELETON LOADER
  ====================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-8 w-full max-w-4xl animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-40 bg-gray-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-48 -left-48 w-[80rem] h-[80rem] bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-48 -right-48 w-[70rem] h-[70rem] bg-gradient-to-r from-amber-300 to-pink-300 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <Settings className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800">
                Platform Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure your learning platform preferences and system behavior
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Reset to Defaults
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving || JSON.stringify(settings) === JSON.stringify(initialSettings)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg transition-all ${
                saving
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : success
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl"
                  : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md hover:shadow-xl"
              }`}
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Changes Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                success 
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="font-medium">
                {success 
                  ? "All changes have been successfully applied to your platform." 
                  : error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* General Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Globe className="w-5 h-5 text-indigo-700" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">General Information</CardTitle>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Basic platform details and contact information
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputBlock
                  label="Platform Name"
                  icon={<Sparkles className="w-4 h-4 text-indigo-500" />}
                  value={settings.siteName}
                  onChange={(v) => handleChange("siteName", v)}
                  placeholder="Shikshana LMS"
                />
                <InputBlock
                  label="Tagline"
                  icon={<Palette className="w-4 h-4 text-purple-500" />}
                  value={settings.tagline}
                  onChange={(v) => handleChange("tagline", v)}
                  placeholder="Empowering Education with Technology"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputBlock
                  label="Support Email"
                  icon={<Mail className="w-4 h-4 text-indigo-500" />}
                  value={settings.supportEmail}
                  onChange={(v) => handleChange("supportEmail", v)}
                  placeholder="support@shikshana.in"
                  type="email"
                />
                <InputBlock
                  label="Contact Number"
                  icon={<Phone className="w-4 h-4 text-emerald-500" />}
                  value={settings.contactNumber}
                  onChange={(v) => handleChange("contactNumber", v)}
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <InputBlock
                label="Website URL"
                icon={<Globe className="w-4 h-4 text-blue-500" />}
                value={settings.websiteUrl}
                onChange={(v) => handleChange("websiteUrl", v)}
                placeholder="https://shikshana.in"
                type="url"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Platform Controls Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-indigo-700" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Platform Controls</CardTitle>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Configure platform behavior and moderation settings
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <ToggleRow
                title="Enable Course Moderation"
                desc="Require admin approval before courses go live on the platform."
                icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
                checked={settings.enableModeration}
                onChange={(v) => handleChange("enableModeration", v)}
              />
              
              <ToggleRow
                title="Auto Teacher Payouts"
                desc="Automatically process teacher payments on a scheduled basis."
                icon={<IndianRupee className="w-5 h-5 text-amber-600" />}
                checked={settings.autoPayouts}
                onChange={(v) => handleChange("autoPayouts", v)}
              />
              
              <ToggleRow
                title="Dark Theme Mode"
                desc="Enable system-wide dark mode for all users."
                icon={<Palette className="w-5 h-5 text-purple-600" />}
                checked={settings.darkTheme}
                onChange={(v) => handleChange("darkTheme", v)}
              />
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 italic">
                  Note: Changes to platform controls may require a platform restart to take full effect.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky bottom-8 max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-indigo-100 rounded-lg">
                <Settings className="w-4 h-4 text-indigo-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Unsaved Changes</h3>
                <p className="text-sm text-gray-600">
                  {JSON.stringify(settings) === JSON.stringify(initialSettings)
                    ? "All settings are up to date"
                    : "You have unsaved changes to your platform settings"}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Reset to Defaults
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saving || JSON.stringify(settings) === JSON.stringify(initialSettings)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow transition-all ${
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : success
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                    : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md"
                }`}
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved Successfully
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ======================
   REUSABLE COMPONENTS
====================== */

function InputBlock({ label, value, onChange, icon, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-4 pr-4 py-3 bg-white/90 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all rounded-xl"
        />
      </div>
    </div>
  );
}

function ToggleRow({ title, desc, icon, checked, onChange }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-4 last:border-none">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-1 p-1.5 bg-indigo-50 rounded-lg">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked 
            ? "bg-indigo-600 hover:bg-indigo-700" 
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </Switch>
    </div>
  );
}