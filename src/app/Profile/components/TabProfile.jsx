"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

/**
 * ✅ Improvements
 * - Professional layout using Card + sections + dividers
 * - Loading state with centered spinner
 * - Error + success Snackbar alerts
 * - Save button disabled unless changes exist
 * - Field validation (email/phone) + helper text
 * - No window.location.reload() (smooth UX)
 * - Keeps userTokens untouched
 */

export default function TabProfile() {
  const API_loggedCustomers = "http://localhost:5000/loggedCustomers";
  const API_Customers = "http://localhost:5000/customers";

  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  const [initialData, setInitialData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    type: "success", // "success" | "error" | "info"
    message: "",
  });

  const [touched, setTouched] = useState({});

  /* ================= Helpers ================= */
  const normalize = (v) => (v ?? "").toString().trim();

  const validators = useMemo(() => {
    const email = normalize(formData.email);
    const phone = normalize(formData.phone);

    const emailOk =
      email.length === 0 ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // simple validation

    const phoneOk =
      phone.length === 0 ||
      /^[0-9+\-\s()]{7,20}$/.test(phone); // flexible phone

    return {
      emailOk,
      phoneOk,
      emailError: !emailOk ? "Please enter a valid email address." : "",
      phoneError: !phoneOk ? "Please enter a valid phone number." : "",
    };
  }, [formData.email, formData.phone]);

  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return (
      normalize(formData.name) !== normalize(initialData.name) ||
      normalize(formData.email) !== normalize(initialData.email) ||
      normalize(formData.phone) !== normalize(initialData.phone) ||
      normalize(formData.city) !== normalize(initialData.city)
    );
  }, [formData, initialData]);

  const canSave = useMemo(() => {
    return (
      !!currentUser &&
      isDirty &&
      validators.emailOk &&
      validators.phoneOk &&
      !saving
    );
  }, [currentUser, isDirty, validators.emailOk, validators.phoneOk, saving]);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      setLoading(true);
      setPageError("");

      try {
        const [loggedRes, customersRes] = await Promise.all([
          fetch(API_loggedCustomers),
          fetch(API_Customers),
        ]);

        if (!loggedRes.ok || !customersRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const loggedCustomers = await loggedRes.json();
        const customers = await customersRes.json();

        const loggedToken = loggedCustomers?.[0]?.userTokens;
        if (!loggedToken) throw new Error("No logged user found");

        const matchedUser = customers.find(
          (user) => user.userTokens === loggedToken
        );

        if (!matchedUser) throw new Error("User not found");

        if (!alive) return;

        setCurrentUser(matchedUser);

        const nextForm = {
          name: matchedUser.name || "",
          email: matchedUser.email || "",
          phone: matchedUser.phone || "",
          city: matchedUser.city || "",
        };

        setFormData(nextForm);
        setInitialData(nextForm);
      } catch (err) {
        if (!alive) return;
        setPageError(err?.message || "Something went wrong");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      alive = false;
    };
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  /* ================= SAVE UPDATE ================= */
  const handleSave = async () => {
    if (!currentUser) return;

    // guard
    if (!validators.emailOk || !validators.phoneOk) {
      setToast({
        open: true,
        type: "error",
        message: "Please fix the highlighted fields before saving.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        userTokens: currentUser.userTokens, // keep same token
      };

      const res = await fetch(`${API_Customers}/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updatedUser = await res.json();

      setCurrentUser(updatedUser);

      const nextForm = {
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        city: updatedUser.city || "",
      };

      setFormData(nextForm);
      setInitialData(nextForm);

      setToast({
        open: true,
        type: "success",
        message: "Profile updated successfully.",
      });
    } catch (err) {
      setToast({
        open: true,
        type: "error",
        message: err?.message || "Update failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!initialData) return;
    setFormData(initialData);
    setTouched({});
    setToast({
      open: true,
      type: "info",
      message: "Changes discarded.",
    });
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <Box className="w-full" sx={{ display: "grid", placeItems: "center", py: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (pageError) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Couldn’t load your profile
          </Typography>
          <Typography sx={{ mt: 1 }} color="text.secondary">
            {pageError}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            No user data found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const initials = (normalize(formData.name)[0] || "U").toUpperCase();

  return (
    <>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 64, height: 64, fontSize: 22 }}>
                {initials}
              </Avatar>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {formData.name || "Your name"}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {formData.email || "No email added yet"}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                  <Chip
                    size="small"
                    label={formData.city ? `City: ${formData.city}` : "City not set"}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={formData.phone ? "Phone added" : "Phone not set"}
                    variant="outlined"
                  />
                  {isDirty && (
                    <Chip size="small" color="warning" label="Unsaved changes" />
                  )}
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={!isDirty || saving}
                sx={{ borderRadius: 2, flex: { xs: 1, sm: "unset" } }}
              >
                Reset
              </Button>

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!canSave}
                sx={{ borderRadius: 2, flex: { xs: 1, sm: "unset" } }}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Form */}
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
            Personal information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="Full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              placeholder="e.g. Mohammed Ebrahim"
            />

            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              placeholder="e.g. +966 5X XXX XXXX"
              error={!!touched.phone && !validators.phoneOk}
              helperText={touched.phone ? validators.phoneError : " "}
            />

            <TextField
              label="Email address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              placeholder="e.g. name@email.com"
              error={!!touched.email && !validators.emailOk}
              helperText={touched.email ? validators.emailError : " "}
            />

            <TextField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              placeholder="e.g. Riyadh"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Footer note */}
          <Typography variant="body2" color="text.secondary">
            Tip: Your changes are saved securely and your account token stays the same.
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.type}
          variant="filled"
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
