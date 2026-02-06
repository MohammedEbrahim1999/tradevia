"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Radio,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import LocalPostOfficeRoundedIcon from "@mui/icons-material/LocalPostOfficeRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";

export default function TabAddresses() {
  const API_customers = "http://localhost:5000/customerAddresses";
  const API_loggedUser = "http://localhost:5000/loggedCustomers";

  const emptyAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  };

  const [addresses, setAddresses] = useState([]);
  const [userToken, setUserToken] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [resA, resU] = await Promise.all([fetch(API_customers), fetch(API_loggedUser)]);
        if (!resA.ok || !resU.ok) throw new Error("Fetch failed");

        const allAddresses = await resA.json();
        const loggedUser = await resU.json();
        const token = loggedUser?.[0]?.userTokens;

        const userAddresses = allAddresses.filter((a) => a.userTokens === token);

        setUserToken(token);
        setAddresses(userAddresses);
      } catch (e) {
        setError("Failed to load addresses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= HELPERS ================= */
  const hasDefault = useMemo(() => addresses.some((a) => a.isDefault), [addresses]);
  const defaultId = useMemo(() => addresses.find((a) => a.isDefault)?.id ?? null, [addresses]);

  const shortAddress = (a) => {
    const parts = [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode, a.country]
      .map((x) => (x || "").trim())
      .filter(Boolean);
    return parts.join(", ");
  };

  const showToast = (type, msg) => setToast({ open: true, type, msg });

  const normalizePhone = (value) => value.replace(/[^\d+]/g, "");

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const e = {};
    const a = selectedAddress || {};

    if (!a.fullName?.trim()) e.fullName = "Full name is required";
    const phone = (a.phone || "").trim();
    if (!phone || phone.length < 8) e.phone = "Phone must be at least 8 digits";
    if (!a.addressLine1?.trim()) e.addressLine1 = "Address line 1 is required";
    if (!a.city?.trim()) e.city = "City is required";
    if (!a.country?.trim()) e.country = "Country is required";

    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================= DEFAULT SELECT ================= */
  const handleSetDefault = async (id) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);

    try {
      await Promise.all(
        updated.map((a) =>
          fetch(`${API_customers}/${a.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(a),
          })
        )
      );
      showToast("success", "Default address updated");
    } catch {
      showToast("error", "Couldn’t update default address");
    }
  };

  /* ================= OPEN/CLOSE ================= */
  const handleAddOpen = () => {
    setMode("add");
    setSelectedAddress({
      ...emptyAddress,
      userTokens: userToken,
      isDefault: !hasDefault,
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleEditOpen = (address) => {
    setMode("edit");
    setSelectedAddress({ ...address });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedAddress(null);
    setFormErrors({});
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!validateForm()) return;

    const willBeDefault = !!selectedAddress?.isDefault;

    try {
      if (mode === "add") {
        const res = await fetch(API_customers, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...selectedAddress, userTokens: userToken }),
        });
        if (!res.ok) throw new Error("Create failed");
        const newAddress = await res.json();

        let next = [...addresses, newAddress];
        if (willBeDefault) next = next.map((a) => ({ ...a, isDefault: a.id === newAddress.id }));

        setAddresses(next);

        if (willBeDefault) await handleSetDefault(newAddress.id);
        showToast("success", "Address added");
      } else {
        const res = await fetch(`${API_customers}/${selectedAddress.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedAddress),
        });
        if (!res.ok) throw new Error("Update failed");

        let next = addresses.map((a) => (a.id === selectedAddress.id ? selectedAddress : a));

        if (willBeDefault) {
          next = next.map((a) => ({ ...a, isDefault: a.id === selectedAddress.id }));
          setAddresses(next);
          await handleSetDefault(selectedAddress.id);
        } else {
          setAddresses(next);
        }

        showToast("success", "Changes saved");
      }

      handleClose();
    } catch {
      showToast("error", "Something went wrong. Please try again.");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this address?");
    if (!ok) return;

    const wasDefault = addresses.find((a) => a.id === id)?.isDefault;

    try {
      const res = await fetch(`${API_customers}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      const next = addresses.filter((a) => a.id !== id);
      setAddresses(next);

      if (wasDefault && next.length > 0) {
        await handleSetDefault(next[0].id);
      }

      showToast("success", "Address deleted");
    } catch {
      showToast("error", "Couldn’t delete address");
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <CircularProgress />
      </div>
    );
  }

  if (error) return <p className="text-center text-red-500">{error}</p>;

  /* ================= SMALL UI HELPERS ================= */
  const Field = ({ label, value }) => (
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
        {label}:
      </Box>{" "}
      {value || "—"}
    </Typography>
  );

  /* ================= RENDER ================= */
  return (
    <>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My Addresses</h2>
          <p className="text-sm text-slate-600">
            Manage your shipping addresses and choose a default one.
          </p>
        </div>

        <Button
          variant="contained"
          onClick={handleAddOpen}
          startIcon={<AddRoundedIcon />}
          className="!rounded-xl !px-4 !py-2"
        >
          Add Address
        </Button>
      </div>

      {/* Warning */}
      {addresses.length > 1 && !hasDefault && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Please select a <b>default address</b> to speed up checkout.
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <HomeRoundedIcon />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No addresses yet</h3>
          <p className="mt-1 text-sm text-slate-600">
            Add your first address to make checkout faster.
          </p>
          <Button
            onClick={handleAddOpen}
            variant="contained"
            startIcon={<AddRoundedIcon />}
            className="mt-5 !rounded-xl !px-5"
          >
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => {
            const isDefault = !!addr.isDefault;

            return (
              <div
                key={addr.id}
                className={[
                  "group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition",
                  "hover:shadow-md hover:-translate-y-[1px]",
                  isDefault
                    ? "border-primary/40 ring-1 ring-primary/30"
                    : "border-slate-200",
                ].join(" ")}
              >
                {/* subtle gradient top */}
                <div
                  className={[
                    "absolute inset-x-0 top-0 h-1.5",
                    isDefault ? "bg-primary/60" : "bg-slate-200/70",
                  ].join(" ")}
                />

                {/* Default badge */}
                {isDefault && (
                  <div className="absolute right-4 top-4">
                    <Chip
                      icon={<CheckCircleRoundedIcon />}
                      label="Default"
                      size="small"
                      color="primary"
                      className="!rounded-lg"
                    />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Tooltip title="Set as default">
                    <span>
                      <Radio
                        checked={addr.isDefault}
                        onChange={() => handleSetDefault(addr.id)}
                        sx={{ mt: -0.6 }}
                      />
                    </span>
                  </Tooltip>

                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <LocationOnRoundedIcon fontSize="small" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-slate-900">{addr.fullName}</h3>
                    </div>

                    <div className="mt-1 text-sm text-slate-600">{addr.phone}</div>

                    <div className="mt-2 text-sm text-slate-500 line-clamp-2">
                      {shortAddress(addr)}
                    </div>

                    <Divider className="!my-4" />

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        {addr.city || "—"} • {addr.country || "—"}
                      </div>

                      <div className="flex items-center gap-1 opacity-95">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEditOpen(addr)}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(addr.id)}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>

                    {/* quick details row */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
                      {addr.postalCode ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          icon={<LocalPostOfficeRoundedIcon />}
                          label={addr.postalCode}
                          sx={{ borderRadius: 2 }}
                        />
                      ) : null}
                      {addr.state ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          icon={<ApartmentRoundedIcon />}
                          label={addr.state}
                          sx={{ borderRadius: 2 }}
                        />
                      ) : null}
                    </Stack>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= DIALOG (Improved) ================= */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
      >
        {/* header with gradient + close */}
        <Box
          sx={{
            px: 2.5,
            pt: 2.25,
            pb: 1.75,
            background:
              "linear-gradient(180deg, rgba(25,118,210,0.10) 0%, rgba(25,118,210,0.00) 80%)",
          }}
        >
          <DialogTitle sx={{ p: 0 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {mode === "add" ? "Add Address" : "Edit Address"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Fill the required fields (*). You can set a default address here.
                </Typography>
              </Stack>

              <Tooltip title="Close">
                <IconButton onClick={handleClose} sx={{ borderRadius: 2 }}>
                  <CloseRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </DialogTitle>
        </Box>

        <DialogContent sx={{ pt: 2.5 }}>
          {/* mini summary card */}
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar sx={{ width: 40, height: 40 }}>
                <PlaceRoundedIcon />
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 700 }} noWrap>
                  {selectedAddress?.fullName?.trim() || "New Address"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                  {selectedAddress ? shortAddress(selectedAddress) || "Start filling the form…" : ""}
                </Typography>
              </Box>
              {selectedAddress?.isDefault ? (
                <Chip
                  size="small"
                  color="primary"
                  icon={<CheckCircleRoundedIcon />}
                  label="Default"
                  sx={{ borderRadius: 2 }}
                />
              ) : (
                <Chip size="small" variant="outlined" label="Not default" sx={{ borderRadius: 2 }} />
              )}
            </Stack>
          </Box>

          <Stack spacing={2}>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Full Name *"
                fullWidth
                value={selectedAddress?.fullName || ""}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                onChange={(e) =>
                  setSelectedAddress({ ...selectedAddress, fullName: e.target.value })
                }
                InputProps={{ startAdornment: <PersonRoundedIcon sx={{ mr: 1, opacity: 0.6 }} /> }}
              />

              <TextField
                label="Phone *"
                fullWidth
                value={selectedAddress?.phone || ""}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                onChange={(e) =>
                  setSelectedAddress({
                    ...selectedAddress,
                    phone: normalizePhone(e.target.value),
                  })
                }
                InputProps={{ startAdornment: <PhoneRoundedIcon sx={{ mr: 1, opacity: 0.6 }} /> }}
              />
            </Box>

            <TextField
              label="Address Line 1 *"
              fullWidth
              value={selectedAddress?.addressLine1 || ""}
              error={!!formErrors.addressLine1}
              helperText={formErrors.addressLine1}
              onChange={(e) =>
                setSelectedAddress({ ...selectedAddress, addressLine1: e.target.value })
              }
            />

            <TextField
              label="Address Line 2"
              fullWidth
              value={selectedAddress?.addressLine2 || ""}
              onChange={(e) =>
                setSelectedAddress({ ...selectedAddress, addressLine2: e.target.value })
              }
            />

            <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TextField
                label="City *"
                fullWidth
                value={selectedAddress?.city || ""}
                error={!!formErrors.city}
                helperText={formErrors.city}
                onChange={(e) => setSelectedAddress({ ...selectedAddress, city: e.target.value })}
              />
              <TextField
                label="State"
                fullWidth
                value={selectedAddress?.state || ""}
                onChange={(e) => setSelectedAddress({ ...selectedAddress, state: e.target.value })}
              />
              <TextField
                label="Postal Code"
                fullWidth
                value={selectedAddress?.postalCode || ""}
                onChange={(e) =>
                  setSelectedAddress({ ...selectedAddress, postalCode: e.target.value })
                }
              />
            </Box>

            <TextField
              label="Country *"
              fullWidth
              value={selectedAddress?.country || ""}
              error={!!formErrors.country}
              helperText={formErrors.country}
              onChange={(e) =>
                setSelectedAddress({ ...selectedAddress, country: e.target.value })
              }
              InputProps={{ startAdornment: <PublicRoundedIcon sx={{ mr: 1, opacity: 0.6 }} /> }}
            />

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={!!selectedAddress?.isDefault}
                  onChange={(e) =>
                    setSelectedAddress({ ...selectedAddress, isDefault: e.target.checked })
                  }
                />
              }
              label={
                <Stack spacing={0.25}>
                  <Typography sx={{ fontWeight: 700 }}>Set as default address</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    This address will be selected automatically at checkout.
                  </Typography>
                </Stack>
              }
            />

            {/* optional preview */}
            <Box
              sx={{
                borderRadius: 3,
                border: "1px dashed",
                borderColor: "divider",
                p: 1.5,
                backgroundColor: "background.default",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Preview
              </Typography>
              <Stack spacing={0.5}>
                <Field label="Name" value={selectedAddress?.fullName} />
                <Field label="Phone" value={selectedAddress?.phone} />
                <Field label="Address" value={selectedAddress ? shortAddress(selectedAddress) : ""} />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2.5,
            pb: 2.25,
            pt: 1.25,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button onClick={handleClose} className="!rounded-xl">
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            className="!rounded-xl"
            startIcon={mode === "add" ? <AddRoundedIcon /> : <CheckCircleRoundedIcon />}
          >
            {mode === "add" ? "Add Address" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.type}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
